"""Import only audited keywords. Never extract terms from publication content.

Usage: python tools/i18n/import-publication-keywords.py <audit.xlsx>
The glossary is manually curated; unknown terms fail instead of being inferred.
"""
import csv
import hashlib
import json
import re
import sys
from pathlib import Path

from lxml import html
from openpyxl import load_workbook

ROOT = Path(__file__).resolve().parents[2]
HERE = Path(__file__).resolve().parent
source = Path(sys.argv[1])
sheet = load_workbook(source, read_only=True, data_only=True)['Acciones Codex']
values = list(sheet.values)
rows = [dict(zip(values[0], row)) for row in values[1:] if row[0]]
assert len(rows) == 84 and len({r['ID'] for r in rows}) == 84

glossary = {}
terms = {}
for entry in csv.DictReader((HERE / 'keyword-glossary.tsv').open(encoding='utf-8'), delimiter='\t'):
    pair = (entry['en'], entry['es'])
    if pair not in terms:
        terms[pair] = f'k{len(terms) + 1:03d}'
    for original in entry['originals'].split('|'):
        key = original.casefold()
        assert key not in glossary, original
        glossary[key] = (terms[pair], entry['sourceLanguage'])

page_path = ROOT / 'investigacion.html'
page = page_path.read_text(encoding='utf-8')
tree = html.fromstring(page)
cards = {c.get('data-publication-id'): c for c in tree.xpath('//*[@data-publication-card]')}
assert set(cards) == {r['ID'] for r in rows}
mapping = {}
audit = []
for row in rows:
    identity = row['ID']
    card = cards[identity]
    assert any(row['DOI'].casefold() in href.casefold() for href in card.xpath('.//@href')), identity
    title = ' '.join(card.xpath('.//h2')[0].text_content().split())
    assert title == ' '.join(row['Título del paper'].split()), (identity, title, row['Título del paper'])
    remove = row['Estado keywords'] == 'No encontradas' or row['Acción keywords'] == 'ELIMINAR'
    originals = [] if remove else [k.strip() for k in (row['Keywords verificados a usar'] or '').split(';') if k.strip()]
    assert remove or (row['Estado keywords'] == 'Verificadas' and row['Acción keywords'] in ('MANTENER', 'REEMPLAZAR') and originals), identity
    mapping[identity] = [glossary[k.casefold()][0] for k in originals]
    audit.append({
        'id': identity, 'doi': row['DOI'], 'title': row['Título del paper'],
        'status': row['Estado keywords'], 'action': row['Acción keywords'],
        'originalKeywords': originals,
        'sourceLanguages': [glossary[k.casefold()][1] for k in originals],
    })

# Remove only existing keyword markup. Runtime creates both views from one array.
tags = r'(?m)^[ \t]*<div class="publication-tags">[\s\S]*?</div>'
details = r'(?m)^[ \t]*<p>\s*<strong data-i18n="content\.s0488">Keywords</strong>[\s\S]*?</p>'
new_page, tag_count = re.subn(tags, '', page)
new_page, detail_count = re.subn(details, '', new_page)
assert (tag_count, detail_count) in ((84, 84), (0, 0)), (tag_count, detail_count)

translation_path = ROOT / 'assets/js/translations.js'
translations = translation_path.read_text(encoding='utf-8')
marker = '// BEGIN AUDITED PUBLICATION KEYWORDS'
translations = translations.split(marker)[0].rstrip() + '\n\n'
dump = lambda value: json.dumps(value, ensure_ascii=False, indent=2)
for language, index in [('en', 0), ('es', 1)]:
    if language == 'en':
        translations += marker + '\n// Source: auditoria_keywords_codex_fanny.xlsx / Acciones Codex.\n// Rebuild with tools/i18n/import-publication-keywords.py; no automatic keyword extraction.\n'
    translations += f'window.FannyTranslations.{language}.keywordTerms = ' + dump({key: pair[index] for pair, key in terms.items()}) + ';\n'
translations += 'window.FannyPublicationKeywordIds = ' + dump(mapping) + ';\n// END AUDITED PUBLICATION KEYWORDS\n'

# Validation precedes writes. No other publication fields or translations are edited.
page_path.write_text(new_page, encoding='utf-8', newline='')
translation_path.write_text(translations, encoding='utf-8', newline='')
(HERE / 'publication-keywords-audit.json').write_text(dump({
    'source': source.name, 'sheet': 'Acciones Codex',
    'sha256': hashlib.sha256(source.read_bytes()).hexdigest(), 'publications': audit,
}) + '\n', encoding='utf-8')
print(json.dumps({'publications': len(rows), 'withKeywords': sum(bool(v) for v in mapping.values()),
    'withoutKeywords': sum(not v for v in mapping.values()), 'concepts': len(terms),
    'occurrences': sum(map(len, mapping.values())), 'removedTagBlocks': tag_count}))
