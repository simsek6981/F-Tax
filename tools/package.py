"""Validate and package only deployable files; no private docs in the artifact."""
from pathlib import Path
import shutil
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
subprocess.run([sys.executable, str(ROOT / 'tools/components.py'), '--check'], check=True)
subprocess.run([sys.executable, str(ROOT / 'tools/verify.py')], check=True)
output = ROOT / 'dist'
if output.exists():
    if output.is_symlink() or output.resolve() != ROOT.resolve() / 'dist':
        raise SystemExit('Refusing unsafe output path')
    shutil.rmtree(output)
output.mkdir()
for page in ROOT.glob('*.html'): shutil.copy2(page, output / page.name)
for file in ['.nojekyll', 'sitemap.xml', 'robots.txt']:
    shutil.copy2(ROOT / file, output / file)
if (ROOT / 'CNAME').exists(): shutil.copy2(ROOT / 'CNAME', output / 'CNAME')
for folder in ['css', 'js', 'icons', 'images', 'fonts']:
    shutil.copytree(ROOT / 'assets' / folder, output / 'assets' / folder)
print('PASS: static deployment artifact created in dist/.')
