# Informe de implementación bilingüe

## Corrección y normalización del 24 de septiembre

- Inicio y Contacto: «privacy principles / principios de privacidad» es texto normal, sin enlace y con el color heredado del párrafo.
- Publications: el enlace al perfil de Google Scholar mantiene su URL. No tiene subrayado normal; se subraya en hover y al enfocarlo con teclado.
- Auditoría institucional de las siete páginas, catálogo, JavaScript, texto estático, atributos alternativos/accesibles y metadatos. Se eliminaron las protecciones excesivas que impedían traducir descriptores institucionales.
- Glosario central `institutionalTerms` con 51 equivalencias, utilizado en frases mediante referencias explícitas. No hay sustituciones globales de texto en ejecución ni cambios en títulos de artículos o revistas.
- Archivos modificados en esta corrección: los siete HTML raíz, `assets/js/translations.js`, `assets/js/i18n.js`, `assets/css/styles.css`, `tools/i18n/README.md` y este informe. Se añadió `tools/i18n/qa-institutional.mjs`. `assets/js/main.js` no se modificó en esta corrección.
- Pruebas de interacción, 154 escenarios responsive y auditoría de términos residuales aprobadas. La auditoría recorre también texto oculto y atributos; las excepciones se registran en `outputs/i18n-institutional-audit.json`.

### Resultado de la búsqueda residual

No se encontraron descriptores institucionales españoles residuales en la interfaz inglesa. Se buscaron todos los términos solicitados, incluidos Universidad, Facultad, Escuela, Centro, Vicerrectoría, Investigación, Innovación, Fondo, Beca, Doctorado, Extranjero, Desarrollo, Prototipos, Género, Ciencia, Convocatoria, Académicas y Obras Civiles.

Las coincidencias restantes se revisaron y corresponden a títulos oficiales de artículos, sus referencias y textos alternativos de vista previa, o a la marca de medio «Cooperativa Ciencia». Esas coincidencias se conservan deliberadamente. `Becas Chile` también se mantiene como nombre del programa. En español se comprobó la ausencia de descriptores institucionales ingleses fuera de títulos y referencias protegidas.

### Casos que requieren confirmación humana

- La tarjeta institucional original dice «Universidad de Cleveland», mientras que otro perfil menciona «Case Western Reserve University». Se tradujo el descriptor a «University of Cleveland», sin asumir que ambas denominaciones representan la misma institución. Conviene confirmar el nombre de esa tarjeta.
- Se mantuvieron las variantes geográficas originales de Miguel Hernández (Elche / Elche-Alicante) y los Andes (Chile / Colombia / Bogotá). No se unificaron entidades ni se alteraron afiliaciones.
- Las traducciones descriptivas de sociedades, centros, unidades y programas siguen el glosario solicitado. Si existe un manual institucional con otra denominación inglesa aprobada, basta actualizar una entrada del glosario.
- Continúan los problemas de contenido de la sección «Revisión editorial pendiente» de este informe: referencias a Alonso/hidrología, datos de edad discordantes y resúmenes fuente incompletos. Esta corrección lingüística no inventa reemplazos para esos datos.

### Glosario incorporado

| Clave | Inglés | Español |
|---|---|---|
| `udpUniversity` | Diego Portales University | Universidad Diego Portales |
| `concepcionUniversity` | University of Concepción | Universidad de Concepción |
| `biobioUniversity` | University of Bío-Bío | Universidad del Bío-Bío |
| `chileUniversity` | University of Chile | Universidad de Chile |
| `andresBelloUniversity` | Andrés Bello University | Universidad Andrés Bello |
| `andesUniversity` | University of the Andes | Universidad de los Andes |
| `catholicSantisimaConcepcionUniversity` | Catholic University of Santísima Concepción | Universidad Católica de la Santísima Concepción |
| `catholicTemucoUniversity` | Catholic University of Temuco | Universidad Católica de Temuco |
| `santoTomasUniversity` | Santo Tomás University | Universidad Santo Tomás |
| `pontificalCatholicChileUniversity` | Pontifical Catholic University of Chile | Pontificia Universidad Católica de Chile |
| `caseWesternReserveUniversity` | Case Western Reserve University | Universidad Case Western Reserve |
| `glasgowUniversity` | University of Glasgow | Universidad de Glasgow |
| `groningenUniversity` | University of Groningen | Universidad de Groningen |
| `miguelHernandezUniversity` | Miguel Hernández University of Elche | Universidad Miguel Hernández de Elche |
| `clevelandUniversity` | University of Cleveland | Universidad de Cleveland |
| `stanfordUniversity` | Stanford University | Universidad de Stanford |
| `facultyMedicine` | Faculty of Medicine | Facultad de Medicina |
| `biomedicalResearchCenter` | Center for Biomedical Research | Centro de Investigación Biomédica |
| `monckebergResearchCenter` | Center for Biomedical Research Dr. Fernando Mönckeberg | Centro de Investigación Biomédica Dr. Fernando Mönckeberg |
| `civilEngineeringSchool` | School of Civil Engineering | Escuela de Obras Civiles |
| `researchInnovationViceRectorate` | Vice-Rectorate for Research and Innovation | Vicerrectoría de Investigación e Innovación |
| `innovationDirectorate` | Innovation Directorate | Dirección de Innovación |
| `researchDoctoralDirectorate` | General Directorate for Research and Doctoral Programs | Dirección General de Investigación y Doctorados |
| `healthyLivingCenter` | Healthy Living Center | Centro de Vida Saludable |
| `lasCondesClinic` | Las Condes Clinic | Clínica Las Condes |
| `assistedReproductionRegistry` | Latin American Registry of Assisted Reproduction | Registro Latinoamericano de Reproducción Asistida |
| `chileanLifestyleMedicineSociety` | Chilean Society of Lifestyle Medicine | Sociedad Chilena de Medicina del Estilo de Vida |
| `chileanNutritionSociety` | Chilean Society of Nutrition | Sociedad Chilena de Nutrición |
| `womenAcademicsFund` | Women Academics Fund | Fondo Académicas |
| `womenAcademicsGenderScienceFund` | Women Academics Fund: Gender and Science | Fondo Académicas: Género y Ciencia |
| `collaborativeResearchFund` | Collaborative Research Fund | Fondo Asociativo |
| `prototypeGenderScience` | Prototype Development: Gender and Science | Desarrollo de Prototipos: Género y Ciencia |
| `prototypeGenderScienceFunding` | Funding for Prototype Development: “Gender and Science” | Financiamiento de Desarrollo de Prototipos: “Género y Ciencia” |
| `prototypeDevelopment` | Prototype Development | Desarrollo de Prototipos |
| `academicDevelopmentFund` | Academic Development Fund | Fondo para Desarrollo Académico |
| `travelSupportFund` | Travel Support Fund | Fondo de Apoyo en Viajes |
| `knowledgeProductionFund` | Knowledge Production Support Fund | Fondo de Apoyo a la Producción de Conocimiento |
| `doctoralScholarshipAbroad` | Doctoral Scholarship Abroad — Becas Chile | Beca doctoral en el extranjero — Becas Chile |
| `chileGovernment` | Government of Chile | Gobierno de Chile |
| `borrowFoundation` | The Borrow Foundation | Fundación Borrow |
| `gatesFoundation` | Gates Foundation | Fundación Gates |
| `globalBurdenDisease` | Global Burden of Disease | Carga Mundial de Enfermedad |
| `globalBurdenDiseaseStudy` | Global Burden of Disease Study | Estudio de Carga Mundial de Enfermedad |
| `globalBurdenDiseasesInjuriesRiskFactorsStudy` | Global Burden of Diseases, Injuries, and Risk Factors Study | Estudio de Carga Mundial de Enfermedades, Lesiones y Factores de Riesgo |
| `globalSarcopeniaLeadership` | Global Leadership Initiative in Sarcopenia | Iniciativa Global de Liderazgo en Sarcopenia |
| `globalMalnutritionLeadership` | Global Leadership Initiative on Malnutrition | Iniciativa Global de Liderazgo sobre Malnutrición |
| `europeanSarcopeniaWorkingGroup` | European Working Group on Sarcopenia in Older People | Grupo Europeo de Trabajo sobre Sarcopenia en Personas Mayores |
| `globalPhysicalActivityQuestionnaire` | Global Physical Activity Questionnaire | Cuestionario Mundial de Actividad Física |
| `mexicoCityProspectiveStudy` | Mexico City Prospective Study | Estudio Prospectivo de la Ciudad de México |
| `fundingSource` | Funding Source | Fuente de financiamiento |
| `callForApplications` | Call for Applications | Convocatoria |

## Entrega

Se implementó EN/ES en Home, Publications, Projects, ACT-Early, Collaborations y sus secciones, Awards & Media y Contact, sin crear páginas duplicadas. El selector funciona con ratón, teclado y touch, tiene estado activo accesible y guarda la preferencia. El documento actualiza `lang` y el contenido de texto y atributos.

Archivos de aplicación modificados: `index.html`, `investigacion.html`, `proyectos.html`, `proyecto.html`, `colaboradores.html`, `awards.html`, `contacto.html`, `assets/js/main.js` y `assets/css/styles.css`. Nuevos: `assets/js/translations.js`, `assets/js/i18n.js` y documentación/pruebas en `tools/i18n/`.

El catálogo central contiene 992 claves por idioma (894 de contenido, 47 de interfaz y 51 del glosario institucional). Incluye navegación, héroes, tarjetas, 63 resúmenes/síntesis disponibles, palabras clave, filtros, chips, resultados, paginación, formularios, mensajes y metadatos. Las fuentes inglesas incompletas no se completaron con datos supuestos. Las imágenes originales —incluidos documentos, logotipos y afiches— se conservan; sus descripciones alternativas se traducen cuando corresponde.

## Pruebas

- Siete páginas × dos idiomas × 11 anchos = 154 escenarios de layout: 320, 364, 390, 480, 500, 768, 800, 986, 1024, 1050 y 1440 px. Sin desbordamiento horizontal ni claves faltantes.
- Selector, idioma inglés inicial incluso con navegador configurado en español, persistencia al recargar/navegar, preferencia inválida y almacenamiento inaccesible.
- Selecciones de los cuatro sistemas de filtros y página actual de publicaciones conservadas al cambiar de idioma.
- Paneles móviles, selecciones pendientes, aplicar, chips removibles y cambio de breakpoint.
- Menú por teclado, Escape, detalles y controles «ver más/ver menos».
- Ambos formularios conservan sus campos y valores; etiquetas, validación y estado se traducen. No se envían mensajes durante las pruebas.
- Comparación con la copia previa: los enlaces se conservan salvo los dos enlaces de privacidad retirados por solicitud expresa; también se conservan IDs, valores de filtros, títulos oficiales, autores y revistas. Todos los archivos locales enlazados existen.

Los resultados y capturas están en `outputs/i18n-*`. Las pruebas de interacción pueden aislarse de Google Fonts usando las fuentes alternativas existentes. No equivalen a una auditoría integral de WCAG ni a una validación de los destinos externos.

## Términos protegidos

Se conservaron nombres de personas y las partes propias de los nombres institucionales, autores y revistas, títulos oficiales de artículos, PhD/MSc/BSc, ACT-Early, ANID, ORCID, Google Scholar, ResearchGate, LinkedIn, DOI, ELHOC, siglas institucionales, URLs, correos e identificadores. Los descriptores institucionales, unidades y fondos se traducen conforme a la regla actualizada del 24 de septiembre; los nombres propios y las siglas permanecen intactos. Los datos internos de filtros no dependen de las etiquetas traducidas.

## Revisión editorial pendiente del contenido original

Estos puntos ya existían; no se sustituyeron por información supuesta:

- Home: título y metadatos sobre hidrología/Alonso Pizarro; el texto accesible del CV también menciona a Alonso.
- Collaborations: párrafo del héroe sobre ingeniería, hidrología e ingeniería hidráulica y metadatos sobre Alonso Pizarro.
- Contact: metadatos sobre Alonso Pizarro.
- ACT-Early: metadatos sobre «Flood Resilience»; la tarjeta de reserva indica 35–39 años y otras secciones indican 35–59. Se requiere confirmar el dato correcto.
- Collaborations contiene el enlace preexistente `#asssistants`, sin destino con ese ID. Se conservó al mantener los enlaces del original; requiere corrección editorial/técnica posterior.
- El formulario existente no tiene servicio de envío conectado. El mensaje de estado refleja esa limitación en ambos idiomas.
- Algunas fuentes de resúmenes contienen frases truncadas, valores p ausentes o inconsistencias. Se tradujo la información disponible, sin reconstruir datos científicos. Las traducciones académicas deben revisarse editorialmente antes de considerarlas versiones oficiales.

Entradas con problemas identificados en el texto fuente:

- `content.s0666`: Associations of diabesity with all‐cause and cardiovascular disease mortality: Findings from the Mexico City Prospective Study
- `content.s0739`: Associations between an inflammatory diet index and severe non-alcoholic fatty liver disease: a prospective study of 171,544 UK Biobank participants
- `content.s0789`: Hygiene Practices and Early Childhood Development in the East Asia-Pacific Region: A Cross-Sectional Analysis
- `content.s0843`: Global prevalence of sarcopenia and severe sarcopenia: a systematic review and meta‐analysis
- `content.s0863`: Associations of muscle mass and grip strength with severe NAFLD: A prospective study of 333,295 UK Biobank participants
- `content.s0928`: Dose-response association between device-measured physical activity and incident dementia: a prospective study from UK Biobank
- `content.s1005`: Optimal cut-off points for waist circumference in the definition of metabolic syndrome in Chile
- `content.s1053`: The joint association of sarcopenia and frailty with incidence and mortality health outcomes: A prospective study
- `content.s1072`: Is older age associated with COVID-19 mortality in the absence of other risk factors? General population cohort study of 470,034 participants
- `content.s1110`: Asociación del polimorfismo rs7903146, del gen TCF7L2, con marcadores de adiposidad y metabólicos en población chilena - resultados del estudio GENADIO
- `content.s1120`: ¿Existe asociación entre asma y adiposidad en la población adulta chilena?
- `content.s1158`: Asociación entre diabetes mellitus tipo 2, historia familiar de diabetes y deterioro cognitivo en adultos mayores chilenos
- `content.s1198`: Asociación entre diabetes mellitus tipo 2 y actividad física en personas con antecedentes familiares de diabetes
- `content.s1223`: Factores de riesgo asociados al desarrollo de hipertensión arterial en Chile
