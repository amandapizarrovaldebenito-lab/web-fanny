# Checklist de lanzamiento SEO

Fecha: 2026-09-29. Host definitivo: fannypetermann-rocha.cl (sin www).

## Verificado localmente

- [x] Siete canonical HTTPS self-referencing y og:url coincidentes.
- [x] Títulos/descripciones EN y ES; Open Graph y Twitter completos.
- [x] JSON-LD válido sintácticamente, Person único y breadcrumbs consistentes.
- [x] sitemap.xml válido con siete URLs limpias.
- [x] robots.txt permite rastreo y apunta al sitemap de producción.
- [x] Imágenes OG y favicons existen localmente con nombres exactos.
- [x] Recursos, diseño y scripts preservados; pruebas EN/ES y formularios controladas.

## Pendiente en producción / cuentas del propietario

- [ ] Publicar los cambios revisados (no se hizo commit/push).
- [ ] HTTPS verified: comprobar certificado válido y HTTP 200 de las siete páginas. La conexión pública no pudo verificarse desde este entorno.
- [ ] www → apex redirect: verificar 301/308 a https://fannypetermann-rocha.cl/ conservando ruta y parámetros; configurarlo en hosting/DNS si falta.
- [ ] HTTP → HTTPS redirect: verificar 301/308, sin bucles ni cadenas innecesarias.
- [ ] Sitemap verification: GET https://fannypetermann-rocha.cl/sitemap.xml devuelve 200 y las siete URLs.
- [ ] Robots verification: GET https://fannypetermann-rocha.cl/robots.txt devuelve 200 y permite assets/páginas.
- [ ] Comprobar HTTP 200 e image/* en las ocho imágenes usadas por OG/Person y los favicons.
- [ ] Validar URLs públicas con Schema Markup Validator y Google Rich Results Test; sintaxis válida no garantiza resultados enriquecidos.
- [ ] Search Console: verificar la propiedad de dominio mediante credenciales/DNS reales del propietario.
- [ ] Sitemap submission: enviar sitemap.xml en Search Console.
- [ ] URL Inspection: inspeccionar las siete URLs, canonical seleccionado y solicitar indexación cuando corresponda.
- [ ] GA4: evaluar e instalar únicamente un identificador real si el propietario lo autoriza; no se añadió ninguno.
- [ ] Core Web Vitals: medir LCP, INP y CLS en producción y revisar datos de campo cuando estén disponibles.
- [ ] Future hreflang evaluation: reevaluar solo si EN/ES llegan a disponer de URLs diferentes; no se añadió hreflang ahora.

No se promete indexación, ranking ni visualización inmediata de favicon o resultados enriquecidos.
