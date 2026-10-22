"""Local preview including GitHub Pages subpath and custom 404 behaviour."""
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
from urllib.parse import urlsplit
import argparse
import json

ROOT = Path(__file__).resolve().parents[1]
PREFIX = urlsplit(json.loads((ROOT/'docs/site.json').read_text(encoding='utf-8'))['base_url']).path.rstrip('/')

class Handler(SimpleHTTPRequestHandler):
    def translate_path(self, path):
        # Keep query strings and normal SimpleHTTPRequestHandler path sanitisation.
        if PREFIX and (path == PREFIX or path.startswith(PREFIX + '/')):
            path = path[len(PREFIX):] or '/'
        return super().translate_path(path)

    def send_error(self, code, message=None, explain=None):
        if code != 404: return super().send_error(code, message, explain)
        content = (ROOT/'404.html').read_bytes()
        self.send_response(404)
        self.send_header('Content-Type', 'text/html; charset=utf-8')
        self.send_header('Content-Length', str(len(content)))
        self.end_headers()
        if self.command != 'HEAD': self.wfile.write(content)

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--port', type=int, default=8000)
    args = parser.parse_args()
    def handler(*a, **kw): return Handler(*a, directory=str(ROOT), **kw)
    server = ThreadingHTTPServer(('127.0.0.1', args.port), handler)
    print(f'Local: http://127.0.0.1:{server.server_port}{PREFIX}/', flush=True)
    server.serve_forever()
