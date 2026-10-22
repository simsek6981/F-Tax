# F-Tax Premium Redesign 2.0

Stand: 16. Oktober 2026. Grundlage: die sechs tatsächlich angehängten HTML-Dateien mit Suffix `(2)` und `logo (2).svg`; die im Auftrag erwähnten älteren Suffixe waren nicht angehängt.

## Referenzanalyse und Gestaltung

Die Vorlage verwendet `#222a35`, `#2e3846`, `#f1f3f6`, `#4a78a8` und `#2f5a86`, scharfkantige Flächen, schräge Bild- und Buttonanschnitte, eine dunkle Hero-Fläche und das geometrische F. Diese Merkmale bleiben erhalten. Die vorherige Mineralgrün-/Kupfergestaltung des Repositorys wurde ersetzt.

- Größere Manrope-Headlines, gezielte Umbrüche und getrennte Größen für Überschriften, Lesetext und kleine Beschriftungen.
- Hero mit dem Bibliotheksmotiv der Vorlage, eigener Text-Bild-Balance und einer zurückhaltenden F-Silhouette.
- Helle und dunkle Leistungsflächen, offene Zielgruppenübersicht, Bild-Text-Abschnitt, vier Schritte und eine eigenständige persönliche Vorstellung.
- Steuerberatung mit sämtlichen vier Leistungsbereichen und den vollständigen Aufzählungen aus der Vorlage. Die vier Prozessoptimierungsbereiche sind unter `steuerberatung.html#digitalisierung` integriert.
- Profilseite mit den belegten Angaben: über zehn Jahre Unternehmensbetreuung, Steuerberaterprüfung Oktober 2024 bei der KSW, Geschäftsführer und Gesellschafter. Kein erfundenes Porträt.
- Smartphone-Menü mit zugänglicher Beschriftung, Escape-, Link- und Außenklickverhalten. Der Terminbutton bleibt auch mobil erreichbar.
- Gestaffelte Hero-Animation, einmalige IntersectionObserver-Reveals, Bild-Reveal mit minimaler Skalierung und dezente Hoverzustände. Basisinhalte sind ohne JavaScript sichtbar. Reduzierte Bewegung wird berücksichtigt.

## Technische Kontinuität

Alle HTML-Seiten bleiben im Repository-Hauptverzeichnis. Ein gemeinsames Stylesheet ersetzt die vorherigen Styles. Header und Footer bleiben statisch eingebunden und über `tools/components.py` synchronisierbar. `dist/` wird ausschließlich als ignoriertes Paket erzeugt. Die Paketierung nimmt jetzt auch Bilder und Fonts auf.

Titel, Beschreibungen, Canonicals, Open Graph, Twitter-Metadaten, strukturierte Daten, Robots-Datei und Indexierungsmodus bleiben erhalten. Die drei Hauptseiten haben zusätzlich ein Vorschaubild. Die bisherigen Weiterleitungen für Buchhaltung, Bilanzierung, Lohnverrechnung und Kontakt bleiben bestehen. Es gab im aktuellen Hauptzweig keine öffentliche Prozessoptimierungsseite; es wird keine neue URL entfernt.

Der bisherige Modus `preview` bleibt erhalten: Noindex und leere Sitemap. Das Repository enthält weiter den vorhandenen Schalter zur späteren Indexierungsfreigabe. Die GitHub-Pages-Automation und deren Variable `PAGES_ENABLED` werden nicht verändert. Der zwischenzeitlich zusammengeführte Hauptzweig wird übernommen: Browser-/WCAG-CI, Fokuswechsel im Mobilmenü und zusätzliche Motion-Tests bleiben erhalten. Die drei Cinematic-CSS-Dateien und das ungenutzte SVG-Motiv werden durch das gemeinsame Referenz-Stylesheet und die Referenzbilder ersetzt.

## Bilder und Schrift

Es werden drei passende Fotos aus der angehängten Referenz lokal als WebP mit je einer kleineren 640-Pixel-Variante ausgeliefert. Explizite Maße vermeiden Layoutsprünge; das Hero-Bild wird priorisiert, weitere Bilder werden verzögert geladen. Originalquellen:

- Bibliothek: https://images.unsplash.com/photo-1505664194779-8beaceb93744
- Besprechung: https://images.unsplash.com/photo-1454165804606-c3d57bc86b40
- Digitale Auswertung: https://images.unsplash.com/photo-1460925895917-afdab827c52f

Die Motive zeigen keine behaupteten eigenen Kanzleiräume oder Mitarbeitenden. Lizenzquelle: [Unsplash-Lizenz](https://unsplash.com/license). Rechte und Nutzungsfreigaben sind vor Veröffentlichung durch F-Tax zu prüfen. Manrope wird lokal eingebunden, die Lizenz liegt unter `assets/fonts/OFL.txt`. Der Browser fragt weder Google Fonts noch Unsplash an.

## Terminanfrage

Die bestehenden öffentlichen EmailJS-Kennungen und der Parametervertrag bleiben unverändert. Nur Name und E-Mail sind Pflichtfelder. Telefon, Unternehmen, Thema, Terminwunsch und Nachricht sind freiwillig. Keine Verfügbarkeitsabfrage und keine verbindliche Terminbuchung. Validierungsfehler fokussieren das betroffene Feld; Versandfehler erhalten die Eingaben. Annahme durch EmailJS und Terminbestätigung werden sprachlich unterschieden.

Das lokale Mailtemplate wurde farblich angeglichen. Es muss im bestehenden EmailJS-Template manuell synchronisiert werden; Details und Variablen in `EMAILJS-SETUP.md`. Keine Änderung im EmailJS-Konto und kein tatsächlicher Versand oder Postfacheingangstest.

## Prüfung

- 30 Kombinationen: fünf Inhaltsseiten bei 360, 390, 768, 1024, 1440 und 1920 Pixeln. Dokumentbreite übersteigt in keiner Kombination die verfügbare Breite. Zusätzlich Überschriften- und Headergrenzen kontrolliert.
- Desktop- und Smartphone-Kompositionen visuell mit der angehängten Referenz verglichen. Leistungsbereich, Profil, Kontakt und Rechtstexte separat betrachtet.
- Mobilmenü öffnen/schließen und Escape; aktiver Navigationszustand; direkte Terminpfade; fehlender Name und ungültige E-Mail im Browser.
- Erfolg und Versandfehler mit einer ausschließlich lokal bereitgestellten, simulierten Fetch-Antwort geprüft. Erfolgszustand leert das Formular, Fehler erhält Eingaben. Kein Netzaufruf an EmailJS aus diesen Testseiten.
- Bestehende 19 JavaScript-Tests prüfen unter anderem Datenvertrag, optionale Angaben, Timeout, Doppelsendesperre, Fehlersituationen, reduzierte Bewegung und Navigation.
- Repository-Prüfung: semantische Struktur, Seitenbestand, Links und Anker, gemeinsame Komponenten, SEO-Metadaten, Schema, Formularvertrag, Release-Umschaltung und Paketierung.

Nicht gemessen: Core Web Vitals unter realem Verkehr und Zustellung im tatsächlichen E-Mail-Postfach. Browserdetails und Screenshots sind separate Aufgabenausgaben.

## Vor Veröffentlichung offen

Unternehmens-/Kontaktangaben, Bildrechte und rechtliche Texte durch F-Tax bestätigen. In der Datenschutzerklärung sind insbesondere Hostingvertrag, EmailJS-Auftragsverarbeitung, verbundener E-Mail-Dienst, Empfänger, Rechtsgrundlage, konkrete Aufbewahrung und Drittlandgarantien markiert. Es wird keine abgeschlossene Prüfung dieser Kontoverträge behauptet.

Am 16.10.2026 herangezogene Primärquellen: [EmailJS REST API](https://www.emailjs.com/docs/rest-api/send/), [EmailJS Datenschutz](https://www.emailjs.com/legal/privacy-policy/) und [GitHub Datenschutz](https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement). Die rechtlichen Entwürfe müssen mit den tatsächlichen Diensten und Verträgen der Kanzlei abgeglichen werden.
