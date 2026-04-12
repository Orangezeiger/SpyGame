# SpyGame SEO Setup

## Bereits umgesetzt
- Meta-Description
- Open Graph Bild
- Twitter Bild
- Favicon
- strukturierte Daten per Schema.org
- `robots.txt`
- `canonical` Link
- `sitemap.xml` Endpoint

## Danach manuell sinnvoll
1. Eigene Produktions-Domain festlegen
2. Seite unter dieser Domain deployen
3. Google Search Console einrichten
4. Domain oder URL-Prefix in Search Console bestaetigen
5. `https://deine-domain.tld/sitemap.xml` in Search Console einreichen
6. Wichtige externe Links auf die Seite aufbauen

## Hinweise
- Der `canonical` Link zeigt aktuell auf `/`, damit keine falsche Domain hart codiert wird.
- Die Sitemap wird dynamisch mit der aktuell aufgerufenen Host-URL erzeugt.
- Nach einem Domain-Wechsel lohnt sich ein erneuter Check der Open-Graph-Vorschau und des Favicons.
