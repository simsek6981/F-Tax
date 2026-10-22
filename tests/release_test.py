"""Exercise public/custom-domain/preview metadata changes on a temporary copy."""
from pathlib import Path
import importlib.util
import shutil
import tempfile

ROOT=Path(__file__).resolve().parents[1]
def module(name,file):
    spec=importlib.util.spec_from_file_location(name,ROOT/'tools'/file)
    result=importlib.util.module_from_spec(spec); spec.loader.exec_module(result); return result

release=module('release','prepare-release.py'); checker=module('checker','verify.py')
with tempfile.TemporaryDirectory(prefix='ftax-release-test-') as tmp:
    copy=Path(tmp)/'website'
    shutil.copytree(ROOT,copy,ignore=shutil.ignore_patterns('.git','.openai','__pycache__','dist','src','templates','build.py'))
    for url,public in [('https://simsek6981.github.io/Yilmaz/',True),('https://example.com/',True),('https://example.com/preview/',False)]:
        release.configure(url,public,copy); checker.verify(copy)
    before=(copy/'index.html').read_bytes()
    for invalid in ['http://example.com/','https://example.com/?key=1','https://name:secret@example.com/']:
        try: release.configure(invalid,True,copy)
        except ValueError: pass
        else: raise AssertionError('Unsafe URL accepted')
    assert (copy/'index.html').read_bytes()==before
print('PASS: metadata switches preserve working relative paths and reject invalid base URLs.')
