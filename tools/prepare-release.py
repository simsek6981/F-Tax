"""Optional metadata switch before publication; not a build or deployment step."""
from pathlib import Path
from urllib.parse import urlsplit
from html import escape
import argparse
import json
import re

ROOT=Path(__file__).resolve().parents[1]

def configure(base_url,public=False,root=ROOT):
    parsed=urlsplit(base_url)
    if parsed.scheme!='https' or not parsed.netloc or parsed.query or parsed.fragment or parsed.username or parsed.password:
        raise ValueError('Use the final HTTPS website URL without credentials, query or fragment.')
    if not re.fullmatch(r'https://[A-Za-z0-9.:-]+(?:/[A-Za-z0-9._~%/-]*)?',base_url):
        raise ValueError('Base URL contains unsupported characters.')
    base=base_url.rstrip('/')+'/'
    settings=json.loads((root/'docs/site.json').read_text(encoding='utf-8'))
    previous=settings['base_url']
    for page in settings['pages']:
        path=root/page['file']
        text=path.read_text(encoding='utf-8').replace(previous,base)
        robots='index, follow' if public and page['type'] not in ('legal','redirect') else 'noindex, nofollow'
        if page['type']=='redirect': robots='noindex, follow'
        text=re.sub(r'<meta name="robots" content="[^"]*">',f'<meta name="robots" content="{robots}">',text)
        if page['file']=='404.html': text=re.sub(r'<base href="[^"]*">',f'<base href="{urlsplit(base).path}">',text)
        path.write_text(text,encoding='utf-8',newline='\n')
    urls=[base+('' if p['file']=='index.html' else p['file']) for p in settings['pages'] if p['type'] not in ('legal','redirect')] if public else []
    xml='<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+''.join('  <url><loc>'+escape(u)+'</loc></url>\n' for u in urls)+'</urlset>\n'
    (root/'sitemap.xml').write_text(xml,encoding='utf-8')
    robots='User-agent: *\nAllow: /\n'+('Sitemap: '+base+'sitemap.xml\n' if public else '# Preview: all pages carry a noindex meta tag. This is not access control.\n')
    (root/'robots.txt').write_text(robots,encoding='utf-8')
    settings.update(base_url=base,indexing='public' if public else 'preview')
    (root/'docs/site.json').write_text(json.dumps(settings,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print('Updated metadata:',settings['indexing'],base)

if __name__=='__main__':
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--base-url',required=True)
    parser.add_argument('--public',action='store_true',help='Enable indexing for the seven non-legal pages.')
    args=parser.parse_args(); configure(args.base_url,args.public)

