# Sistema bilingüe EN / ES

El sitio mantiene una sola versión HTML por página. Inglés es el idioma predeterminado; español se activa únicamente por selección del visitante.

## Archivos

- `assets/js/translations.js`: catálogo central, con 894 entradas de contenido, 47 de interfaz y 51 términos institucionales para cada idioma. Mantener las mismas claves en `en` y `es`.
- `assets/js/i18n.js`: resolución de claves anidadas, interpolación segura mediante `textContent`, traducción de atributos, selector y persistencia.
- `assets/js/main.js`: filtros, paginación, controles desplegables, detalles, formulario y visor conectados al mismo catálogo.
- Las siete páginas raíz contienen claves `data-i18n` y su contenido inicial en inglés.
- `assets/css/styles.css`: estados del selector EN/ES y exclusión de los nuevos contenedores de texto de reglas reservadas para iconos.

## Agregar o modificar una traducción

1. Buscar el texto en `translations.js` y actualizar ambas versiones. `content.sNNNN` son claves estables del inventario original; no renumerarlas. Las cadenas compartidas generadas por JavaScript usan `ui.*`.
2. Para un elemento nuevo, añadir la misma clave en ambos idiomas y `data-i18n="content.clave"` al nodo de texto correspondiente. Conservar en HTML el texto inglés como alternativa sin JavaScript.
3. No aplicar `data-i18n` al contenedor de iconos u otros elementos: usar un `span` para su texto.
4. Atributos admitidos: `data-i18n-placeholder`, `data-i18n-title`, `data-i18n-aria-label`, `data-i18n-alt` y `data-i18n-content` (metadatos). Los atributos de textos de controles desplegables también se traducen.
5. Para contenido dinámico: `FannyI18n.t('ui.clave', {parametro: valor})`; para conservar su vinculación al cambiar de idioma: `FannyI18n.setText(elemento, 'ui.clave', parametros)`.
6. Los componentes que dependen del estado escuchan `languagechange`. Volver a renderizar los textos no debe restablecer filtros, página, campos ni paneles.

La API también proporciona `getTranslation`, `translatePage`, `setAttribute`, `formatNumber` y `formatDate`. Los formatos regionales son `en-US` y `es-CL`.

La clave de almacenamiento es `fanny-site-language`. Solo acepta `en` o `es`; valores inválidos o almacenamiento inaccesible producen inglés inicial. El selector sigue funcionando sin almacenamiento. No se consulta el idioma del navegador.

## Glosario institucional

`translations.en.institutionalTerms` y `translations.es.institutionalTerms` contienen las equivalencias compartidas de universidades, facultades, centros, unidades, fondos, becas y organismos. Por ejemplo, `institutionalTerms.udpUniversity` devuelve «Diego Portales University» o «Universidad Diego Portales».

Para componer una oración o atributo sin duplicar la traducción institucional, usar una referencia:

```js
"Funded through the {@institutionalTerms.womenAcademicsFund} – UDP"
```

`getTranslation` y `t` resuelven estas referencias antes de interpolar parámetros. La resolución tiene protección frente a ciclos. No se reemplazan palabras de forma global en el DOM: solo cambian los nodos vinculados a claves explícitas. Los títulos de artículos y los nombres de revistas no participan en esta composición.

No proteger una frase completa con `translate="no"` solo por contener «Universidad», «Facultad» o «Fondo». Proteger únicamente los nombres propios que deben mantenerse. `Becas Chile`, `Cooperativa Ciencia`, los instrumentos y bases de datos con nombre propio, y los títulos publicados son excepciones documentadas, no descriptores sueltos.

## Protección de contenido académico

Los nombres de personas, las partes propias de los nombres institucionales, las revistas, las referencias bibliográficas, los títulos oficiales de artículos y términos como PhD, MSc, BSc, ACT-Early, ANID, UDP, VRII, CIB, GENCI, InES, ORCID, Google Scholar, ResearchGate, LinkedIn, DOI y ELHOC permanecen intactos. Los descriptores institucionales y los nombres descriptivos de fondos sí se traducen. Los nodos correspondientes utilizan `translate="no"`; los títulos de artículos incluyen un idioma explícito. Las oraciones traducibles conservan sus nombres propios dentro del catálogo.

Nunca traducir `href`, `src`, IDs, clases, atributos de filtrado o valores de opciones. Las opciones del formulario tienen valores explícitos para que cambiar su etiqueta no modifique los datos enviados.

## Verificación

Los scripts usan Node.js y Playwright con Microsoft Edge. Con Playwright disponible en el entorno:

```sh
node tools/i18n/qa-layout.mjs
node tools/i18n/qa-interactions.mjs
node tools/i18n/qa-institutional.mjs
```

También se puede indicar `PLAYWRIGHT_MODULE` como URL de archivo del módulo instalado. `OFFLINE_FONTS=1` permite pruebas de comportamiento independientes de Google Fonts; usa las fuentes alternativas ya definidas por el sitio.

`qa-layout.mjs` comprueba las siete páginas, ambos idiomas y 11 anchos. `qa-interactions.mjs` comprueba persistencia, nombres protegidos, todos los filtros, paginación, paneles móviles, teclado, formularios, almacenamiento no disponible y preferencias inválidas. Crea capturas en `outputs/`.

El inventario y las herramientas de migración inicial se archivaron fuera del sitio. El catálogo JavaScript es la fuente mantenida; no se necesita ejecutar un generador para desplegar.
