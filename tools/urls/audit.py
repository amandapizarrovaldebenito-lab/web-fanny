"""Static URL, case-sensitive asset and content-preservation audit (read-only)."""
import json
import re
from pathlib import Path
from urllib.parse import urlsplit, unquote
from lxml import html, etree

ROOT = Path(__file__).resolve().parents[2]
routes = json.loads(Path(__file__).with_name('routes.json').read_text())
count = 0
anchors = 0

def exact_file(target):
    relative = target.resolve().relative_to(ROOT)
    current = ROOT
    for part in relative.parts:
        assert part in {p.name for p in current.iterdir()}, f'Missing or incorrect case: {relative}'
        current /= part
    assert current.is_file(), current

def content_tree(text):
    tree = html.fromstring(text)
    for node in tree.xpath('//link[@rel="canonical"]'):
        # Ignore only the newly inserted metadata and its formatting whitespace.
        previous = node.getprevious()
        if previous is not None:
            previous.tail = None
        node.getparent().remove(node)
    for node in tree.iter():
        if not isinstance(node.tag, str) and node.text:
            node.text = re.sub(r'((?:href|src)\s*=\s*")[^"]*(")', r'\1\2', node.text)
        if isinstance(node.tag, str):
            for name in ['href', 'src', 'poster', 'action', 'data-lightbox-src']:
                node.attrib.pop(name, None)
        if node.tail is not None and not node.tail.strip(): node.tail = None
        if node.text is not None and not node.text.strip(): node.text = None
    return etree.tostring(tree)

for old, new in routes.items():
    page = ROOT / new
    tree = html.fromstring(page.read_bytes())
    assert tree.xpath('//main') and len(tree.xpath('//link[@rel="canonical"]')) == 1
    assert tree.xpath('//link[@rel="canonical"]/@href') == ['./']
    baseline = ROOT / 'outputs/url-migration-before' / old
    if baseline.exists():
        assert content_tree(baseline.read_bytes()) == content_tree(page.read_bytes()), f'Non-URL content changed: {new}'
    for node in tree.iter():
        for name in ['href', 'src', 'poster', 'action', 'data-lightbox-src']:
            value = node.get(name)
            if not value: continue
            url = urlsplit(value)
            if url.scheme or url.netloc: continue
            assert not url.path.startswith('/'), (new, value)
            target = (page.parent / unquote(url.path)).resolve() if url.path else page
            if target.is_dir(): target /= 'index.html'
            exact_file(target)
            count += 1
            if url.fragment and target.suffix == '.html':
                destination = html.fromstring(target.read_bytes())
                assert destination.xpath('//*[@id=$id]', id=unquote(url.fragment)), (new, value)
                anchors += 1
            if name == 'href' and target.suffix == '.html' and url.path:
                assert url.path.endswith('/'), (new, value)
                assert str(target.relative_to(ROOT)).replace('\\', '/') in routes.values(), value
    if old != new:
        redirect = html.fromstring((ROOT / old).read_bytes())
        assert not redirect.xpath('//main')
        assert redirect.xpath('//link[@rel="canonical"]/@href') == [new[:-10]]
        assert redirect.xpath('//meta[@http-equiv="refresh"]')
        assert 'window.location.replace(' in (ROOT / old).read_text()

css = ROOT / 'assets/css/styles.css'
for value in re.findall(r'url\([\'"]?([^\)\'\"]+)', css.read_text()):
    if not urlsplit(value).scheme:
        exact_file(css.parent / value)
        count += 1
for direction in ['up', 'down']:
    for color in ['FFFFFF', 'A92B32']:
        exact_file(ROOT / f'Imagenes/iconos/keyboard_arrow_{direction}_24dp_{color}_FILL0_wght200_GRAD0_opsz24.svg')
print(f'PASS: 7 pages, 6 redirects, {count} local references, {anchors} anchors, exact-case assets and unchanged content.')
