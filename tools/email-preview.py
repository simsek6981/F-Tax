"""Render escaped variables for a local, fictional design example."""
from pathlib import Path
from html import escape
import re

ROOT=Path(__file__).resolve().parents[1]
TEMPLATE=ROOT/'assets/email-templates/contact-notification.html'

def render(values):
    text=TEMPLATE.read_text(encoding='utf-8')
    text=re.sub(r'\{\{\^(\w+)\}\}(.*?)\{\{/\1\}\}',lambda m: m[2] if not values[m[1]] else '',text,flags=re.S)
    return re.sub(r'\{\{(\w+)\}\}',lambda m: escape(values[m[1]],quote=True),text)

if __name__=='__main__':
    values={'from_name':'Alex Beispiel','from_email':'alex@example.com','reply_to':'alex@example.com','company':'Beispielunternehmen','phone':'','appointment':'Dienstagvormittag, gerne online','topic':'Buchhaltung','message':'Guten Tag,\n\nich suche Unterstützung bei der laufenden Buchhaltung meines Unternehmens. Gerne würde ich besprechen, welche Unterlagen für den Einstieg hilfreich sind und wie die Zusammenarbeit ablaufen kann.\n\nVielen Dank und freundliche Grüße\nAlex Beispiel'}
    sample=render(values).replace('<title>Neue Terminanfrage | F-Tax</title>','<title>F-Tax · E-Mail-Designvorschau</title><meta name="robots" content="noindex, nofollow">')
    sample=re.sub(r'(<body[^>]*>)',r'\1<p style="margin:0;padding:12px 20px;text-align:center;font:12px/1.6 Arial,sans-serif;color:#302735;background:#dfed9c">Designvorschau mit fiktiven Beispieldaten. Nicht als EmailJS-Vorlage verwenden.</p>',sample,count=1)
    (ROOT/'docs/contact-notification-preview.html').write_text(sample,encoding='utf-8')
    checked=render(dict(values,message='<script>alert("x")</script>\nZweite Zeile & Ende',company=''))
    assert '<script>' not in checked and '&lt;script&gt;' in checked
    assert '\nZweite Zeile &amp; Ende' in checked
    assert 'Nicht angegeben' in checked and '{{' not in checked
    assert '\n\n' in render(values)
    print('PASS: email example generated; escaping, optional fields and multiline message preserved.')
