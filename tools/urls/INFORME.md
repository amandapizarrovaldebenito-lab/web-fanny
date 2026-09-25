# Migración de URLs — Fanny Petermann-Rocha

Fecha: 25 de septiembre de 2026.

## 1. Inspección original

Se inspeccionaron las siete páginas completas, sus enlaces y atributos de recursos, los tres JavaScript, el CSS, el inventario de imágenes, iconos, documentos, herramientas y archivos ocultos de configuración. La carpeta `.agents` no contenía instrucciones. No existían subcarpetas de páginas, router, `<base>`, redirects ni lógica para `file://`.

La estructura real usaba nombres españoles para cinco páginas. No existían `publications.html`, `projects.html`, `collaborations.html`, `contact.html` ni `act-early.html`; no se inventaron esos alias.

```text
web-fanny/
├── index.html              Home
├── investigacion.html      Publications
├── proyectos.html          Projects
├── proyecto.html           ACT-Early
├── colaboradores.html      Collaborations
├── awards.html             Awards & Media
├── contacto.html           Contact
├── assets/
│   ├── css/styles.css
│   ├── js/{main,i18n,translations}.js
│   └── images/             Imágenes WebP existentes
├── Imagenes/{imagenes,iconos}/
├── Información/            CV, documentos e imágenes existentes
├── tools/i18n/
├── outputs/                Resultados locales ignorados por Git
└── .gitignore
```

`assets/js/main.js` controla el menú principal, dropdown Projects, filtros, detalles, paginación y lightbox. `i18n.js` controla EN/ES y `localStorage`; no contenía lógica de rutas. `translations.js` conserva todo el catálogo académico.

## 2. Estructura final

```text
web-fanny/
├── index.html                       Home real, conservada
├── investigacion.html               Redirect
├── proyectos.html                   Redirect
├── proyecto.html                    Redirect
├── colaboradores.html               Redirect
├── awards.html                      Redirect
├── contacto.html                    Redirect
├── publications/index.html
├── projects/
│   ├── index.html
│   └── act-early/index.html
├── collaborations/index.html
├── awards/index.html
├── contact/index.html
├── assets/                          Misma ubicación
├── Imagenes/                        Misma ubicación
├── Información/                     Misma ubicación
└── tools/
    ├── i18n/                        Herramientas adaptadas a las rutas nuevas
    └── urls/
        ├── routes.json
        ├── migrate.py
        ├── audit.py
        ├── qa.mjs
        └── INFORME.md
```

## 3. Páginas trasladadas y redirects

| Archivo antiguo conservado | URL limpia relativa a la base del sitio | Página real |
| --- | --- | --- |
| `investigacion.html` | `publications/` | `publications/index.html` |
| `proyectos.html` | `projects/` | `projects/index.html` |
| `proyecto.html` | `projects/act-early/` | `projects/act-early/index.html` |
| `colaboradores.html` | `collaborations/` | `collaborations/index.html` |
| `awards.html` | `awards/` | `awards/index.html` |
| `contacto.html` | `contact/` | `contact/index.html` |

La nomenclatura existente para Awards era `awards.html`; se mantiene una sola ruta, `awards/`. Home sigue siendo el `index.html` original en la raíz, con su contenido completo.

Los seis redirects tienen canonical, `window.location.replace()`, meta refresh dentro de `noscript` y enlace visible accesible. JavaScript conserva query string y fragmento. Con JavaScript activo, HTTP/HTTPS lleva a la carpeta limpia y `file://` al archivo explícito.

El fallback sin JavaScript usa `carpeta/index.html` para que tampoco abra un índice de carpeta en Windows. Esta excepción solo pertenece a las páginas antiguas de redirect. Sin JavaScript, ese fallback puede mostrar `index.html` bajo HTTP; su canonical sigue apuntando a la carpeta limpia. La navegación normal de las siete páginas reales conserva href limpios en su HTML.

## 4. Archivos creados y modificados

Creados: los seis `index.html` interiores y los cinco archivos de `tools/urls/` del árbol anterior.

Modificados:

- `index.html`: enlaces limpios relativos, canonical y versión de caché de `main.js`.
- Los seis HTML antiguos: convertidos en redirects, sin contenido académico duplicado.
- `assets/js/main.js`: adaptación local de enlaces y resolución de tres rutas dinámicas de iconos.
- `tools/i18n/import-publication-keywords.py`: ahora trabaja sobre `publications/index.html`.
- Los cuatro `tools/i18n/qa-*.mjs`: usan las páginas reales y servidores de pruebas que resuelven directorios a `index.html`.
- `tools/i18n/README.md`: documentación actualizada de rutas y comprobaciones.

No cambiaron `assets/css/styles.css`, `assets/js/i18n.js`, `assets/js/translations.js`, imágenes ni documentos descargables. No se añadieron dependencias de producción, frameworks o backend. Las herramientas de QA emplean los runtimes de desarrollo ya disponibles.

## 5. JavaScript y apertura directa

`enableLocalFileNavigation()` vive en `main.js`. Se ejecuta solo si `window.location.protocol === 'file:'` y transforma temporalmente enlaces relativos cuyo pathname termina en `/`, añadiendo `index.html` antes de cualquier query string o fragmento. Omite anclas puras, URLs con esquema y URLs externas que comienzan por `//`.

Ejemplos comprobados: `./` → `./index.html`, `../` → `../index.html`, `../../publications/` → `../../publications/index.html`, `projects/?source=test#featured-project` → `projects/index.html?source=test#featured-project`.

Bajo HTTP y HTTPS la función sale sin tocar ningún href. Se conserva la clave `fanny-site-language`, los identificadores i18n, los eventos y el idioma inicial inglés.

## 6. Assets y profundidad

La migración calculó cada ruta desde el archivo de origen y su nueva ubicación. Un nivel usa `../assets/`, `../Imagenes/` o `../Información/`; ACT-Early usa `../../`. No se añadió `<base>` ni se convirtieron los enlaces a rutas que empiecen por `/`.

Los iconos dinámicos de View details, Show more y Filters se resuelven desde la URL de `main.js`, evitando que busquen `Imagenes/` dentro de la subcarpeta actual. Se actualizó la versión de caché del script a `20260925-urls`.

Las rutas CSS de imágenes hover ya eran relativas al archivo CSS y no necesitaban cambios. Se comprobaron existencia y mayúsculas/minúsculas de los recursos locales, incluidos CV y documentos enlazados. Los recursos enlazados de `Información/` ya estaban versionados, aunque la carpeta está ignorada para archivos nuevos.

## 7. Canonical, sitemap y robots

No se encontró CNAME, dominio oficial configurado, canonical previa, sitemap.xml ni robots.txt. El remoto Git identifica el repositorio, pero no confirma un dominio público desplegado; no se convirtió en un dominio inventado.

Se añadieron canonical relativas: `./` en cada página real y la carpeta destino en cada redirect. Se resuelven bajo la base efectiva, también en un proyecto de GitHub Pages. Cuando se confirme el dominio definitivo, pueden sustituirse por equivalentes absolutos. No se crearon sitemap.xml ni robots.txt sin una base pública confirmada.

## 8. Problemas adicionales

- Corregido dentro del alcance de navegación: `#asssistants` en el CTA Research Assistants de Collaborations no existía; ahora apunta a `#students`, el ID real.
- Detectados y conservados por estar fuera del alcance académico: el título de Home todavía menciona Hydrology Research; su descripción y el aria-label del CV mencionan Alonso Pizarro. La descripción de ACT-Early menciona Flood Resilience. Esas cadenas también están en el catálogo EN/ES. No se corrigieron durante esta migración.
- No se cambió el mecanismo de envío del formulario ni ningún enlace externo.

## 9. Pruebas

`tools/urls/audit.py`: siete páginas reales, seis redirects, 654 referencias locales y 17 anclas. Comprueba existencia y capitalización de assets, rutas relativas, canonical y ausencia de contenido completo duplicado. Compara el DOM contra la copia previa guardada localmente en `outputs/url-migration-before/`, excluyendo únicamente atributos de rutas, canonical y espacios de formato: contenido, clases, i18n y accesibilidad conservados.

`tools/urls/qa.mjs`: navegador Edge real con cuatro modalidades: apertura directa `file://`, servidor HTTP en raíz, HTTP bajo `/repository/` y HTTPS simulado mediante interceptación local bajo `/repository/`. No se hizo un despliegue público ni se verificó un certificado/dominio real. Google Fonts se bloqueó durante las pruebas para evitar dependencia de la red; se usaron las fuentes de respaldo existentes.

Recorridos y controles comprobados individualmente:

| Comprobación | Resultado |
| --- | --- |
| Home → Publications → Home | Correcto |
| Home → Projects → Home | Correcto |
| Home → Collaborations → Home | Correcto |
| Home → Awards → Home | Correcto |
| Home → Contact → Home | Correcto |
| Projects → ACT-Early | Correcto |
| ACT-Early → Projects | Correcto |
| Home → ACT-Early, CTA directo | Correcto |
| Páginas interiores → Home, logo | Correcto |
| Footer y todos sus destinos internos | Correcto |
| Menú móvil y dropdown Projects | Correcto |
| Selector EN/ES y persistencia al recargar | Correcto |
| Imágenes e iconos iniciales y dinámicos | Correcto |
| Los seis redirects con query string y ancla | Correcto |
| Los seis redirects locales sin JavaScript | Correcto |

La regresión existente `qa-interactions.mjs` pasó con las rutas nuevas: filtros, paginación, detalles, formularios, menú por teclado, idioma y navegación entre las siete páginas. `qa-keywords.mjs` pasó para las 84 publicaciones, ambos idiomas y siete anchos, sin desbordamiento.

Abrir directamente `index.html` en Windows mediante `file://` funciona sin servidor, terminal ni herramientas adicionales. Ningún recorrido probado produjo un listado de carpetas. En las pruebas HTTP/HTTPS con JavaScript, las URLs de navegación terminan en `/` y no muestran `index.html`, tanto en raíz como bajo una subruta.

## 10. Repetir las verificaciones

```text
python tools/urls/audit.py
node tools/urls/qa.mjs
node tools/i18n/qa-interactions.mjs
node tools/i18n/qa-keywords.mjs
```

Las pruebas de navegador aceptan `PLAYWRIGHT_MODULE` para usar el Playwright disponible en el entorno. Solo las pruebas requieren estas herramientas; el sitio no las necesita para abrirse ni publicarse. `migrate.py` documenta la migración de una sola ejecución y se niega a ejecutarse otra vez sobre redirects; no es un paso de despliegue.

Para publicar, incluir las seis carpetas nuevas junto con los cambios de los HTML raíz y `assets/js/main.js`. No se realizó commit, push ni despliegue en esta tarea.
