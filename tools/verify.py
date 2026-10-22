"""Verify the directly deployable repository root. Python standard library only."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit, unquote
import argparse
import json
import re
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]

class Document(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.ids=[]; self.links=[]; self.assets=[]; self.meta={}; self.canonical=[]
        self.h1=0; self.mains=0; self.title=''; self.in_title=False; self.lang=''
        self.schemas=[]; self.jsons={}; self.script_kind=None; self.script_id=''; self.buffer=''
        self.headings=[]; self.labels=[]; self.fields=[]; self.script_paths=[]
    def handle_starttag(self,tag,attrs):
        a=dict(attrs)
        if 'id' in a: self.ids.append(a['id'])
        if tag=='html': self.lang=a.get('lang','')
        if tag=='h1': self.h1+=1
        if re.fullmatch('h[1-6]',tag): self.headings.append(int(tag[1]))
        if tag=='main': self.mains+=1
        if tag=='title': self.in_title=True
        if tag=='a' and 'href' in a: self.links.append(a['href'])
        if tag=='label': self.labels.append(a.get('for'))
        if tag in ('input','select','textarea'): self.fields.append(a)
        if tag=='link':
            if a.get('rel')=='canonical': self.canonical.append(a.get('href'))
            if a.get('rel') in ('stylesheet','icon'): self.assets.append(a['href'])
        if tag in ('img','script') and 'src' in a: self.assets.append(a['src'])
        if tag=='script' and 'src' in a: self.script_paths.append(a['src'])
        if tag=='img': assert 'alt' in a and 'width' in a and 'height' in a, 'Image requires alt and dimensions'
        if tag=='meta': self.meta[a.get('name',a.get('property',''))]=a.get('content','')
        if tag=='script' and a.get('type') in ('application/ld+json','application/json'):
            self.script_kind=a['type']; self.script_id=a.get('id',''); self.buffer=''
    def handle_data(self,data):
        if self.in_title: self.title+=data
        if self.script_kind: self.buffer+=data
    def handle_endtag(self,tag):
        if tag=='title': self.in_title=False
        if tag=='script' and self.script_kind:
            value=json.loads(self.buffer)
            if self.script_kind=='application/ld+json': self.schemas.append(value)
            else: self.jsons[self.script_id]=value
            self.script_kind=None

def verify(root=ROOT,allow_legacy=False):
    settings=json.loads((root/'docs/site.json').read_text(encoding='utf-8'))
    base=settings['base_url']; public=settings['indexing']=='public'
    expected={p['file']:p for p in settings['pages']}
    pages=sorted(root.glob('*.html')); docs={}; errors=[]
    if {p.name for p in pages}!=set(expected): errors.append('Unexpected or missing root HTML pages')
    for path in pages:
        text=path.read_text(encoding='utf-8'); d=Document(); d.feed(text); docs[path.name]=d
        p=expected.get(path.name,{})
        if p.get('type')=='redirect':
            target=p['target'].split('#')[0]
            canonical=base+('' if target=='index.html' else target)
            if d.canonical!=[canonical] or d.meta.get('robots')!='noindex, follow': errors.append(f'{path.name}: legacy redirect metadata')
            if p['target'] not in text or 'http-equiv="refresh"' not in text: errors.append(f'{path.name}: redirect missing')
            continue
        nav=re.search(r'<nav id="navigation"[^>]*>(.*?)</nav>',text,re.S)
        if not nav or re.findall(r'href="([^"]+)"',nav[1])!=['index.html','steuerberatung.html','ueber-mich.html']: errors.append(f'{path.name}: main navigation must contain exactly three pages')
        if d.h1!=1 or d.mains!=1: errors.append(f'{path.name}: expected one H1 and main')
        if d.lang!='de-AT': errors.append(f'{path.name}: wrong language')
        if len(d.ids)!=len(set(d.ids)): errors.append(f'{path.name}: duplicate IDs')
        if any(b>a+1 for a,b in zip(d.headings,d.headings[1:])): errors.append(f'{path.name}: heading level skipped')
        if any(ord(c)<32 and c not in '\n\r\t' for c in text) or '\ufffd' in text: errors.append(f'{path.name}: invalid character')
        for key in ('description','viewport','robots','og:title','og:description','og:url','og:locale','og:type','twitter:title','twitter:description','twitter:card'):
            if not d.meta.get(key): errors.append(f'{path.name}: missing {key}')
        url=base+('' if path.name=='index.html' else path.name)
        if d.canonical!=[url] or d.meta.get('og:url')!=url: errors.append(f'{path.name}: canonical mismatch')
        if d.meta.get('og:title')!=d.title or d.meta.get('twitter:title')!=d.title: errors.append(f'{path.name}: social title mismatch')
        if d.meta.get('viewport')!='width=device-width, initial-scale=1': errors.append(f'{path.name}: viewport')
        robots='index, follow' if public and p.get('type')!='legal' else 'noindex, nofollow'
        if d.meta.get('robots')!=robots: errors.append(f'{path.name}: indexing mismatch')
        if path.name!='404.html':
            if len(d.schemas)!=1: errors.append(f'{path.name}: structured data missing')
            else:
                graph=d.schemas[0].get('@graph',[])
                org=next((item for item in graph if item.get('@type')=='Organization'),{})
                if org.get('name')!='F-Tax Steuerberatung GmbH' or org.get('taxID')!='ATU82256979': errors.append('Company schema mismatch')
                if any(k in org for k in ('aggregateRating','review','telephone','email')): errors.append('Unverified company schema fields')
                web=next((item for item in graph if item.get('@type')=='WebPage'),{})
                if web.get('url')!=url: errors.append(f'{path.name}: schema URL mismatch')
    for name,d in docs.items():
        for link in d.links+d.assets:
            u=urlsplit(link)
            if u.scheme or u.netloc: continue
            target=(root/unquote(u.path)).resolve() if u.path else root/name
            if not target.is_relative_to(root.resolve()): errors.append(f'{name}: escaped path {link}'); continue
            if not target.exists(): errors.append(f'{name}: missing {link}'); continue
            if u.fragment and target.suffix=='.html':
                target_doc=docs.get(target.name)
                if target_doc and unquote(u.fragment) not in target_doc.ids: errors.append(f'{name}: missing anchor {link}')
            if 'prozessoptimierung' in link: errors.append(f'{name}: disabled page linked')
        for field in d.fields:
            if field.get('id') not in d.labels: errors.append(f'{name}: field without label')
    for key in ('title','description'):
        values=[d.title if key=='title' else d.meta.get(key) for name,d in docs.items() if expected[name]['type']!='redirect']
        if len(values)!=len(set(values)): errors.append(f'Duplicate {key}')
    sitemap=ET.parse(root/'sitemap.xml')
    locs=[e.text for e in sitemap.findall('.//{http://www.sitemaps.org/schemas/sitemap/0.9}loc')]
    required=[base+('' if n=='index.html' else n) for n,p in expected.items() if p['type'] not in ('legal','redirect')] if public else []
    if set(locs)!=set(required): errors.append('Sitemap does not match indexing mode')
    robots=(root/'robots.txt').read_text(encoding='utf-8')
    if 'Disallow: /\n' in robots: errors.append('Crawling blocked; noindex must remain readable')
    c=docs['index.html']
    config=c.jsons.get('contact-config',{})
    if config!={'serviceId':'service_ja02fgi','templateId':'template_tk14gwp','publicKey':'VaQ_PnlLN756oJY4H'}: errors.append('EmailJS configuration mismatch')
    fields={f.get('name') for f in c.fields}
    if fields!={'from_name','from_email','phone','company','topic','message','website','appointment'}: errors.append('Form field contract changed')
    if {f.get('name') for f in c.fields if 'required' in f}!={'from_name','from_email'}: errors.append('Only name and email may be required')
    if c.script_paths.count('assets/js/contact.js')!=1: errors.append('Contact script missing or duplicated')
    for name,d in docs.items():
        if name!='index.html' and 'assets/js/contact.js' in d.script_paths: errors.append(f'{name}: unexpected form script')
    for name in ('index.html','steuerberatung.html','ueber-mich.html'):
        if name!='index.html' and 'index.html#termin' not in docs[name].links: errors.append(f'{name}: missing direct appointment path')
    if not (root/'.nojekyll').exists(): errors.append('.nojekyll missing')
    if not allow_legacy and any((root/f).exists() for f in ('src','templates','build.py')): errors.append('Legacy build files remain')
    if (root/'prozessoptimierung.html').exists(): errors.append('Disabled page is present')
    if errors: raise SystemExit('\n'.join(errors))
    print(f'PASS: {len(docs)} root pages; links, anchors, metadata, schema, form contract, sitemap and indexing ({settings["indexing"]}).')

if __name__=='__main__':
    parser=argparse.ArgumentParser(); parser.add_argument('--allow-legacy',action='store_true')
    verify(allow_legacy=parser.parse_args().allow_legacy)

