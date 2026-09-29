# Informe SEO de producción

Fecha: 2026-09-29. Dominio canónico: https://fannypetermann-rocha.cl/

## Auditoría y alcance

Se inspeccionaron los siete HTML reales, translations.js, i18n.js y la navegación principal de main.js. No existían sitemap.xml, robots.txt ni CNAME. Los canonical eran relativos (`./`); no había Open Graph, Twitter ni JSON-LD. Las siete imágenes solicitadas y la imagen de Person existen con la capitalización exacta. El cargo en UDP y la afiliación a Glasgow están respaldados por la biografía actual de Home.

Los siete HTML mantienen CSS, cuatro favicons (32, 48, 192 y 512), apple-touch-icon, theme-color #A92B32 y scripts originales con sus rutas. Home y Contact mantienen el SDK de EmailJS. No se modificaron diseño, navegación, publicaciones, formularios ni main.js/i18n.js. Los cuerpos son idénticos al original salvo el ARIA del CV.

## Resultado por página

| Page | Title (EN) | Meta description (EN) | Canonical | Robots | OG image | Schema | Breadcrumb | Validation |
|---|---|---|---|---|---|---|---|---|
| Home | Fanny Petermann-Rocha \| Epidemiology Researcher in Chile | Academic website of Dr. Fanny Petermann-Rocha, a public health and epidemiology researcher in Chile focused on lifestyle, ageing, nutrition, sarcopenia and frailty. | https://fannypetermann-rocha.cl/ | index, follow; previews permitidos | https://fannypetermann-rocha.cl/Imagenes/imagenes/hero_home.jpg | WebSite, Person, ProfilePage | No aplica | PASS local: estructura, JSON, recursos, EN/ES y H1 |
| Publications | Research Publications \| Fanny Petermann-Rocha | Explore research publications by Fanny Petermann-Rocha in epidemiology, public health, nutrition, healthy ageing, physical activity, sarcopenia and frailty. | https://fannypetermann-rocha.cl/publications/ | index, follow; previews permitidos | https://fannypetermann-rocha.cl/Imagenes/imagenes/journal_do_all_vegetarians_have.JPG | CollectionPage, BreadcrumbList | Home → Publications | PASS local: estructura, JSON, recursos, EN/ES y H1 |
| Projects | Research Projects \| Fanny Petermann-Rocha | Explore Fanny Petermann-Rocha’s research projects in public health, epidemiology, healthy ageing, reproductive health, digital health and population health. | https://fannypetermann-rocha.cl/projects/ | index, follow; previews permitidos | https://fannypetermann-rocha.cl/Imagenes/imagenes/convocatoria_act_early.jpeg | CollectionPage, BreadcrumbList | Home → Projects | PASS local: estructura, JSON, recursos, EN/ES y H1 |
| ACT-Early | ACT-Early \| Sarcopenia & Frailty Research in Chile | ACT-Early, led by Fanny Petermann-Rocha, investigates early detection of sarcopenia and frailty in middle-aged adults to support healthier ageing in Chile. | https://fannypetermann-rocha.cl/projects/act-early/ | index, follow; previews permitidos | https://fannypetermann-rocha.cl/Imagenes/imagenes/project_act_early.png | WebPage, BreadcrumbList, ResearchProject | Home → Projects → ACT-Early | PASS local: estructura, JSON, recursos, EN/ES y H1 |
| Collaborations | Research Collaborations \| Fanny Petermann-Rocha | Explore Fanny Petermann-Rocha’s national and international research collaborations, scientific networks, memberships and research assistants. | https://fannypetermann-rocha.cl/collaborations/ | index, follow; previews permitidos | https://fannypetermann-rocha.cl/Imagenes/imagenes/hero_collaborators.png | CollectionPage, BreadcrumbList | Home → Collaborations | PASS local: estructura, JSON, recursos, EN/ES y H1 |
| Awards & Media | Awards & Media \| Fanny Petermann-Rocha | Explore awards, scientific recognition and media appearances highlighting Fanny Petermann-Rocha’s work in public health and epidemiology. | https://fannypetermann-rocha.cl/awards/ | index, follow; previews permitidos | https://fannypetermann-rocha.cl/Imagenes/imagenes/hero_awards.png | CollectionPage, BreadcrumbList | Home → Awards & Media | PASS local: estructura, JSON, recursos, EN/ES y H1 |
| Contact | Contact Fanny Petermann-Rocha \| Research Collaboration | Contact Fanny Petermann-Rocha for research collaboration, academic projects, speaking invitations and media enquiries in public health and epidemiology. | https://fannypetermann-rocha.cl/contact/ | index, follow; previews permitidos | https://fannypetermann-rocha.cl/Imagenes/imagenes/hero_contact.jpg | ContactPage, BreadcrumbList | Home → Contact | PASS local: estructura, JSON, recursos, EN/ES y H1 |

Robots en las siete páginas: `index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1`.

## Internacionalización

Se añadieron 14 claves dedicadas por idioma: `seo.{home,publications,projects,actEarly,collaborations,awards,contact}.{title,description}`. Title, description, OG title/description y Twitter title/description comparten esas claves. Los valores ES son exactamente los solicitados. Se conserva el URL único y no se añade hreflang. El JSON-LD se sirve estáticamente en inglés y declara ambos idiomas.

Se retiraron las claves obsoletas de metadata `content.metaindex`, `metacolaboradores`, `metacontacto`, `metaproyecto`, `metaproyectos`, `metainvestigacion`, `metaawards` y el antiguo título `s0400`. Se corrigió `content.s0413` en EN/ES y el ARIA estático del CV. Las menciones legítimas de Alonso como colaborador permanecen.

## Archivos modificados y creados

- `index.html`
- `publications/index.html`
- `projects/index.html`
- `projects/act-early/index.html`
- `collaborations/index.html`
- `awards/index.html`
- `contact/index.html`
- `assets/js/translations.js`
- Creados: `sitemap.xml`, `robots.txt`, `SEO_HEAD_REPORT.md`, `SEO_LAUNCH_CHECKLIST.md`.

## Validaciones y límites

- Exactamente un title, description, robots, canonical, theme-color y H1 en cada página. OG y Twitter completos y sin duplicados.
- Canonical absoluto HTTPS coincide con og:url; sin www, GitHub ni noindex en las páginas canónicas.
- JSON-LD parseable, identidades consistentes y breadcrumbs absolutos. La validación sintáctica local no equivale a aprobación de Google Rich Results.
- XML del sitemap válido: solamente las siete URLs solicitadas. Robots permite todos los recursos.
- Prueba real en Edge con file://: siete páginas, cambio EN → ES, title/description/OG/Twitter correctos, un H1 visible y ningún error JavaScript.
- Comparación automática: todos los href de CSS/favicon y src de scripts idénticos a la línea base; todos esos archivos locales existen.
- Pruebas controladas del modal de Home y Contact: validación, EN/ES, envío único, éxito/error, reset/conservación, foco y SDK no disponible. Sin enviar correos reales.
- La conexión pública a HTTPS no pudo establecerse desde este entorno; no se afirma que el despliegue, los redirects HTTP/www o las imágenes OG públicas estén verificados. Revisar checklist después de publicar.
- Referencias históricas a Hydrology/Flood Resilience permanecen únicamente en reportes antiguos y un comentario CSS; no son metadata publicada y se conservaron fuera del alcance.
- No se cambiaron redirects HTML heredados, CNAME ni configuración del hosting.
- No se hizo commit ni push.
