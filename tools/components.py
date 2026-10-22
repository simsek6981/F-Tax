"""Synchronise shared static components. No runtime templating or dependencies."""
from pathlib import Path
import argparse
import re

ROOT = Path(__file__).resolve().parents[1]

def sync(check=False):
    failed = []
    for path in ROOT.glob('*.html'):
        html = path.read_text(encoding='utf-8')
        for name, tag in [('header', 'header'), ('footer', 'footer')]:
            component = (ROOT / 'components' / (name + '.html')).read_text(encoding='utf-8').strip()
            if name == 'header':
                component = component.replace(f'href="{path.name}"', f'href="{path.name}" aria-current="page"')
                if path.stem in ('steuerberatung', 'buchhaltung', 'lohnverrechnung', 'bilanzierung'):
                    component = component.replace('class="nav-services"', 'class="nav-services active-parent"')
            html = re.sub(fr'<{tag} class="site-{name}">.*?</{tag}>', lambda _: component, html, flags=re.S)
        if html != path.read_text(encoding='utf-8'):
            if check: failed.append(path.name)
            else: path.write_text(html, encoding='utf-8', newline='\n')
    if failed: raise SystemExit('Stale shared components: ' + ', '.join(failed))
    print('PASS: shared header and footer are consistent.')

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--check', action='store_true')
    sync(parser.parse_args().check)
