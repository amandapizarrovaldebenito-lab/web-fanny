# Auditoría de keywords de Publications

Fuente única de los conceptos: `auditoria_keywords_codex_fanny.xlsx`, hoja **Acciones Codex**, las 84 filas de datos. El Excel se leyó sin modificarlo. Se verificó la correspondencia de cada fila con el sitio por ID, DOI y título. Las instrucciones sobre categorías del Excel quedan fuera de este cambio.

## Resultado

| Métrica | Total |
| --- | ---: |
| Publicaciones revisadas | 84 |
| Publicaciones con keywords verificados | 52 |
| Publicaciones sin keywords | 32 |
| REEMPLAZAR | 49 |
| MANTENER | 3 |
| ELIMINAR | 32 |
| Apariciones de keywords verificados, contando cada publicación | 218 |
| Apariciones originales en inglés | 191 |
| Apariciones originales en español | 27 |
| EN → ES con cambio de texto | 167 |
| EN → ES conservadas iguales, por ejemplo Sarcopenia, Diabetes y siglas | 24 |
| ES → EN con cambio de texto | 27 |
| Pares terminológicos distintos EN/ES del diccionario | 123 |

Los recuentos de traducciones son **apariciones por publicación**, no términos únicos. Las 191 entradas de origen inglés tienen versión española, incluidas las 24 cuya escritura no cambia. Los términos se reutilizan: 111 pares aparecen en listas originales inglesas y 21 en listas españolas; nueve pares se comparten entre ambos orígenes.

## Implementación

- `assets/js/translations.js`: diccionario `keywordTerms` EN/ES y mapa `FannyPublicationKeywordIds` con claves específicas para las 84 publicaciones. Los IDs de términos reutilizan traducciones, sin duplicar arrays EN/ES por paper.
- `assets/js/i18n.js`: `publicationKeywords(id, language)` y renderizado compartido de chips y detalle desde el mismo array. El selector EN/ES los actualiza sin recarga. Los arrays vacíos no crean contenedores ni encabezados Keywords.
- `investigacion.html`: retirada exclusiva de los antiguos chips y párrafos de keywords. El resto del contenido permanece intacto.
- `tools/i18n/keyword-glossary.tsv`: diccionario manual reproducible, con originales, equivalentes EN/ES e idioma de origen.
- `tools/i18n/import-publication-keywords.py`: importación estricta desde la hoja indicada. Falla ante términos desconocidos, discrepancias de ID/DOI/título o estados no admitidos. No extrae ni genera conceptos.
- `tools/i18n/publication-keywords-audit.json`: trazabilidad fila por fila y huella SHA-256 del Excel.
- `tools/i18n/qa-keywords.mjs`: reconciliación de las 84 tarjetas con la auditoría y el diccionario, además de comprobaciones de idioma y anchos.
- `tools/i18n/KEYWORDS-INFORME.md`: este informe y lista completa de eliminaciones.

No se añadieron consultas de red ni generación de keywords al navegador. Los enlaces existentes a OpenAlex para **citaciones** permanecen intactos; no alimentan los keywords.

## Revisión terminológica manual

- `Hand Strength`, `Grip strength` y `handgrip strength`: se conservan las formas inglesas respectivas en sentence case; comparten **Fuerza de prensión** en español.
- `Muscle, Skeletal` y `Muscle skeletal`: **Skeletal muscle / Músculo esquelético**, normalización de orden sin conceptos adicionales.
- `Ageing` y `Aging`: **Ageing / Envejecimiento**. `Aged` y `older people` mantienen sus formas inglesas y usan **Personas mayores**.
- `Lyfe Style`: errata ortográfica normalizada a **Lifestyle / Estilo de vida**. El original queda registrado en la auditoría.
- `healthy weight-obese`: se conserva **Healthy weight-obese / Peso saludable-obesidad**, sin reinterpretarlo como obesidad metabólicamente saludable ni añadir un fenotipo que el Excel no especifica. Es una formulación poco habitual del original; queda señalada para revisión editorial si se desea precisar su redacción.
- `Metabolic`: **Metabolic / Metabólico**, sin ampliarlo a síndrome ni a enfermedad metabólica.
- `Physical capability`: **Capacidad funcional física**, diferenciada de `physical fitness` (**Condición física**).
- `Semaglutide`: **Semaglutida**; `NAFLD`, `NASH`, `FTO`, `EWGSOP2`, `Life’s Essential 8` y `Life’s Simple 7` conservan su escritura.
- `Alpha-Ketoglutarate-Dependent Dioxygenase FTO`: **Dioxigenasa FTO dependiente de alfa-cetoglutarato**. Se contrastó únicamente el equivalente lingüístico en [DeCS/BIREME](https://decs.bvsalud.org/ths/?filter=ths_termall&q=obesidad&sort=name), sin importar términos alternativos ni conceptos de esa fuente.
- `Transcription Factor 7-Like 2 Protein`: **Proteína similar al factor de transcripción 7 de tipo 2**, conservando los identificadores numéricos.

## Verificaciones realizadas

- Las 84 filas coinciden por ID, DOI y título antes de la importación.
- Los 52 registros verificados muestran exactamente sus conceptos originales traducidos; los 32 ELIMINAR no tienen chips ni bloque Keywords en EN o ES.
- Los chips y el detalle coinciden término a término y en orden, tras cambios ES → EN → ES sin recarga.
- Comparación del HTML contra la versión anterior: solo desaparece el marcado de keywords. Títulos, autores, revistas, años, DOI, citas, abstracts, imágenes, enlaces y categorías permanecen intactos.
- El catálogo previo de traducciones se conserva íntegro: no se reescribieron los abstracts traducidos.
- Pruebas funcionales existentes aprobadas: filtros de publicaciones, paginación, conservación del estado al cambiar idioma, filtros móviles y paneles de detalles. También pasó la regresión de las siete páginas.
- Todas las tarjetas se comprobaron en 320, 390, 500, 800, 986, 1050 y 1440 px, en ambos idiomas, sin desbordamiento horizontal. Inspección visual de la primera tarjeta expandida en escritorio y móvil. Pruebas automatizadas con fuentes de respaldo, bloqueando Google Fonts para evitar dependencia de red.

Para repetir la importación:

```text
python tools/i18n/import-publication-keywords.py <ruta/auditoria_keywords_codex_fanny.xlsx>
```

Para repetir las comprobaciones (Playwright instalado o `PLAYWRIGHT_MODULE` configurado):

```text
node tools/i18n/qa-keywords.mjs
node tools/i18n/qa-interactions.mjs
```

Durante esta entrega se ejecutó además `qa-keywords.mjs --compare-head` para demostrar que no cambiaron datos ajenos a keywords frente al commit previo. Esa opción solo corresponde mientras HEAD sea dicha versión previa.

## Publicaciones cuyos keywords fueron eliminados

1. **2026-02** — Diabetes en el embarazo y neurodesarrollo: Un llamado urgente a la acción
2. **2026-03** — Leisure-Time Physical Activity Is Associated With Reduced Risks of Mortality in Adults With General or Abdominal Obesity in Mexico
3. **2026-06** — Global burden of metabolic dysfunction-associated steatotic liver disease, 1990–2023, and projections to 2050: a systematic analysis for the Global Burden of Disease Study 2023
4. **2026-07** — Global, regional and national burden of ischemic heart disease attributable to suboptimal diet, 1990–2023: a Global Burden of Disease study
5. **2026-08** — Quantifying the fatal and non-fatal burden of disease associated with child growth failure, 2000–2023: a systematic analysis from the Global Burden of Disease Study 2023
6. **2025-02** — Leisure-Time Physical Activity and Obesity Risk in Adults in Mexico
7. **2024-01** — Diet modifies the association between alcohol consumption and severe alcohol-related liver disease incidence
8. **2024-07** — Disponibilidad y seguridad hídrica en el desarrollo de enfermedades crónicas no transmisibles ¿Nuevos factores de riesgo?
9. **2023-02** — Association Between the AHA Life's Essential 8 Score and Incident All-Cause Dementia: A Prospective Cohort Study from UK Biobank
10. **2023-03** — Vegetarians: Past, Present, and Future Regarding Their Diet Quality and Nutritional Status
11. **2023-07** — An Opportunity for Prevention: Associations Between the Life's Essential 8 Score and Cardiovascular Incidence Using Prospective Data from UK Biobank
12. **2023-10** — Reply to: “Defining severe NAFLD based on ICD codes in large cohorts: Balancing feasibility and limitations”
13. **2023-11** — Reflexiones sobre la tuberculosis en Chile: avances y compromisos futuros
14. **2023-12** — Contaminación por partículas en Chile: ¿Cuál es su asociación con enfermedades cardiovasculares?
15. **2022-02** — Reply to: “Associations of muscle mass and grip strength with severe NAFLD: A prospective study of 333,295 UK Biobank participants”
16. **2022-04** — Weight-for-Height, Body Fat, and Development in Children in the East Asia and Pacific Region
17. **2022-10** — En búsqueda de una salud sostenible en Chile: rol de la investigación interdisciplinaria
18. **2021-01** — En busca de la armonización de datos en salud: una tarea pendiente
19. **2021-04** — Nonlinear Associations Between Cumulative Dietary Risk Factors and Cardiovascular Diseases, Cancer, and All-Cause Mortality: A Prospective Cohort Study From UK Biobank
20. **2021-05** — Sarcopenic obesity and its association with respiratory disease incidence and mortality – Authors’ reply
21. **2021-06** — Associations between physical frailty and dementia incidence: a prospective study from UK Biobank – Authors' reply
22. **2020-02** — Comparison of two different frailty measurements and risk of hospitalisation or death from COVID-19: findings from UK Biobank
23. **2020-11** — Associations between physical frailty and dementia incidence: a prospective study from UK Biobank
24. **2020-12** — Is older age associated with COVID-19 mortality in the absence of other risk factors? General population cohort study of 470,034 participants
25. **2020-15** — Una dieta antiinflamatoria disminuiría el riesgo de mortalidad por todas las causas
26. **2018-02** — Consumo de carnes rojas y su asociación con mortalidad
27. **2018-05** — EL TRANSPORTE ACTIVO: podría reducir hasta en un 40% el riesgo de desarollar cáncer, enfermedades cardiovasculares y mortalidad prematura
28. **2018-07** — El consumo de frutas y verduras se asocia a menor mortalidad: 5 porciones al día es bueno, ¡pero 10 serían mejor!
29. **2018-08** — Repetido, pero cierto: Una alimentación saludable es la clave para una mejor salud
30. **2018-09** — Inactividad física y obesidad ¿cuál es su repercusión en el gasto económico de diabetes mellitus 2 en Chile?
31. **2017-03** — Dietary fat and total energy intake modifies the association of genetic profile risk score on obesity: evidence from 48 170 UK Biobank participants
32. **2017-05** — Consumo de bebidas azúcaradas ayer y hoy: ¿cuál es el escenario para la población chilena?
