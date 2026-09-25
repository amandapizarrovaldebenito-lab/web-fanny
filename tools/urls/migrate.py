"""One-time, validated migration of the original seven pages. No content rewriting."""
import json
import posixpath
import re
from pathlib import Path
from urllib.parse import urlsplit, urlunsplit, unquote

ROOT = Path(__file__).resolve().parents[2]
routes = json.loads((Path(__file__).with_name('routes.json')).read_text())
originals = {old: (ROOT / old).read_text(encoding='utf-8') for old in routes}
assert all('<main ' in page for page in originals.values()), 'Only run against original full pages.'
assert all(not (ROOT / new).exists() for old, new in routes.items() if old != new)

def rebase(value, new):
    url = urlsplit(value)
    if url.scheme or url.netloc or not url.path:
        return value
    assert not url.path.startswith('/'), value
    old_path = unquote(url.path)
    assert (ROOT / old_path).exists(), value
    directory = posixpath.dirname(new) or '.'
    if old_path in routes:
        destination = posixpath.dirname(routes[old_path]) or '.'
        relative = posixpath.relpath(destination, directory) + '/'
    else:
        relative = posixpath.relpath(url.path, directory)
    query = 'v=20260925-urls' if old_path == 'assets/js/main.js' else url.query
    return urlunsplit(('', '', relative, query, url.fragment))

prepared = {}
for old, new in routes.items():
    def attribute(match):
        return match[1] + rebase(match[2], new) + match[3]
    text = re.sub(r'((?:href|src|poster|action|data-lightbox-src)\s*=\s*")([^"]*)(")', attribute, originals[old])
    assert 'rel="canonical"' not in text
    text = text.replace('</head>', '  <link rel="canonical" href="./">\n  </head>', 1)
    prepared[new] = text

# Save a local baseline for the content/visual regression audit before any page writes.
baseline = ROOT / 'outputs/url-migration-before'
baseline.mkdir(parents=True, exist_ok=True)
for old, text in originals.items():
    (baseline / old).write_text(text, encoding='utf-8', newline='')

labels = {'investigacion.html': 'Publications', 'proyectos.html': 'Projects',
          'proyecto.html': 'ACT-Early', 'colaboradores.html': 'Collaborations',
          'awards.html': 'Awards &amp; Media', 'contacto.html': 'Contact'}
for new, text in prepared.items():
    (ROOT / new).parent.mkdir(parents=True, exist_ok=True)
    (ROOT / new).write_text(text, encoding='utf-8', newline='')
for old, new in routes.items():
    if old == new:
        continue
    clean = posixpath.dirname(new) + '/'
    redirect = f'''<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Redirecting | PhD Fanny Petermann-Rocha</title>
    <link rel="canonical" href="{clean}">
    <script>
      const cleanTarget = "{clean}";
      const localTarget = "{new}";
      const target = (window.location.protocol === "file:" ? localTarget : cleanTarget)
        + window.location.search + window.location.hash;
      window.location.replace(target);
      document.addEventListener("DOMContentLoaded", () => {{
        document.querySelector("a").setAttribute("href", target);
      }});
    </script>
    <noscript><meta http-equiv="refresh" content="0; url={new}"></noscript>
  </head>
  <body>
    <p>Redirecting to <a href="{new}">{labels[old]}</a>.</p>
  </body>
</html>
'''
    (ROOT / old).write_text(redirect, encoding='utf-8', newline='')
print('Migrated six pages; preserved root Home and six legacy redirects.')
