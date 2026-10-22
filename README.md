# F-Tax Steuerberatung GmbH

Statische Website für Ferhat Yilmaz und die F-Tax Steuerberatung GmbH. **Premium Redesign 2.0** entwickelt die bereitgestellte HTML-Referenz weiter: Schiefergrau, Weiß, helles Grau und Stahlblau; geometrische Anschnitte aus dem F-Logo, große Manrope-Überschriften und lokal gespeicherte Referenzfotos. Kein Framework oder notwendiger Build-Schritt. Schrift, Bilder und Animationen benötigen keine externen Dienste.

## Seiten und Dateien

| Datei | Inhalt |
| --- | --- |
| `index.html` | Kanzlei, Leistungen, Kurzbiografie und Terminanfrage |
| `steuerberatung.html` | Buchhaltung, Bilanzierung, Steuern, Gründung und Partner-Lohnverrechnung |
| `ueber-mich.html` | Hero und Biografie von Ferhat Yilmaz |
| `impressum.html`, `datenschutz.html` | Vorhandene rechtliche Entwürfe |
| `buchhaltung.html`, `bilanzierung.html`, `lohnverrechnung.html`, `kontakt.html` | Statische Weiterleitungen |
| `assets/css/style.css` | Funktions- und Layoutbasis |
| `assets/js/main.js` | Menü, Header und Scroll-Reveals |
| `assets/js/contact.js` | EmailJS, Validierung, Lade- und Fehlerzustände |
| `assets/images/` | Originalporträt von Ferhat Yilmaz, transparente WebP-Abstufungen und bestehende Referenzmotive |
| `assets/fonts/` | Lokale variable Manrope-Schrift samt SIL-OFL-Lizenz |
| `assets/email-templates/contact-notification.html` | HTML-Mail in der Schiefergrau-/Stahlblau-Palette |

Das Logo verwendet die bereitgestellte Originalgrafik mit F-Symbol, „F - TAX“ und „STEUER / BERATUNG“, ohne neu gesetzte Schrift. Die unveränderte Referenz liegt in `assets/icons/logo-reference.png`; die verwendete Fassung kürzt lediglich den weißen Außenrand. Die Startseite zeigt das freigegebene Porträt von Ferhat Yilmaz mit Transparenz und ohne Anschnitt. Die übrigen Fotos illustrieren das Thema und behaupten keine Kanzleiräume oder Mitarbeitenden. Die Website konzentriert sich auf Steuerberatung, Buchhaltung, Bilanzierung und Lohnverrechnung über Kooperationspartner. Über mich enthält nur Hero und Biografie.

## Lokale Vorschau

```sh
python tools/serve.py
```

Vorschau: `http://127.0.0.1:8000/Yilmaz/`. Die Root-Dateien funktionieren ohne Build auf GitHub Pages. `.nojekyll`, Weiterleitungen, Canonicals, strukturierte Daten und die vorhandene Pages-Konfiguration bleiben erhalten.

Der gegenwärtige Modus in `docs/site.json` ist `preview`: öffentliche Seiten tragen `noindex`, die Sitemap ist deshalb leer. Das ist der bereits vorhandene Freigabestatus. Für eine öffentliche Freigabe nach Prüfung der Unternehmens- und Rechtstexte:

```sh
python tools/prepare-release.py --public --base-url https://simsek6981.github.io/Yilmaz/
```

Bei einer bestätigten eigenen Domain stattdessen deren wirkliche HTTPS-Adresse verwenden. Eine Veröffentlichung oder Indexierungsfreigabe erfolgt nicht automatisch durch dieses Redesign.

## Terminanfrage und EmailJS

Die Terminanfrage auf der Startseite verlangt nur Name und E-Mail-Adresse. Weitere Angaben sind freiwillig; eine verbindliche Kalenderbuchung findet nicht statt. Der vorhandene EmailJS-Vertrag und die öffentlichen Kennungen bleiben erhalten: Service `service_ja02fgi`, Template `template_tk14gwp`, Public Key `VaQ_PnlLN756oJY4H`. Der Versand sperrt Doppelabsendungen, zeigt Validierungs- und Netzwerkfehler an und bestätigt einen Termin erst nach persönlicher Rückmeldung.

Das lokale HTML-Template ist **noch nicht automatisch mit EmailJS synchronisiert**. Im EmailJS-Dashboard unter **Email Templates → template_tk14gwp → Code Editor / HTML** den Inhalt von `assets/email-templates/contact-notification.html` einfügen und speichern. Subject: `F-Tax Terminanfrage: {{topic}}`; Reply To: `{{reply_to}}`; To Email: festes bestätigtes Kanzleipostfach. Weitere Felder und Variablen stehen in `docs/EMAILJS-SETUP.md`. Der Live-Versand und der Postfacheingang wurden nicht ausgelöst.

## Bewegung und Zugänglichkeit

Die Choreografie des Hero-Bereichs läuft ohne Ladebildschirm. Weitere Inhalte erscheinen beim Scrollen einmalig über IntersectionObserver und die native Web Animations API. Die HTML-Inhalte sind stets vorhanden und ohne JavaScript lesbar. `prefers-reduced-motion` deaktiviert Bewegungen. Navigation, Formular und Fokuszustände sind per Tastatur nutzbar.

## Prüfungen

Playwright ist bereits als Entwicklungsabhängigkeit installiert. Für die automatischen Desktop-, Smartphone- und WCAG-Prüfungen:

```sh
npm ci
npm run test:ui
```

Der Teststarter startet die vorhandene Python-Vorschau auf einem freien lokalen Port und beendet sie nach den Tests. Python muss verfügbar sein (`PYTHON` kann den Interpreter überschreiben). Er nutzt installiertes Playwright-Chromium oder unter Windows vorhandenes Microsoft Edge. Falls beides fehlt: `npx playwright install chromium`. Es werden keine zusätzlichen Testbibliotheken benötigt.

Einzeln: `npm run test:browser`, `npm run test:mobile`, `npm run test:a11y`. Ergebnisse und Screenshots landen standardmäßig in `output/playwright/`. `FTAX_QA_DIR`, `FTAX_BROWSER_CHANNEL` und `FTAX_BASE_URL` überschreiben Ausgabeordner, Browser und eine bereits laufende Vorschau. Alle E-Mail-Antworten werden in den Tests simuliert.

Die Smartphone-Tests prüfen 320, 375, 390, 430 und 768 px mit Touch-Eingabe und zweifacher Pixeldichte. Die bisherigen Desktopprüfungen bleiben erhalten. Details: `docs/QUALITY.md`; Designentscheidungen: `docs/brand-spec.md`.

Ausgeführt:

```sh
python tools/components.py --check
python tools/verify.py
python tests/release_test.py
node --check assets/js/main.js
node --check assets/js/contact.js
node --test tests/contact.test.js tests/motion.test.js
python tools/package.py
```

Zusätzlich wurden Startseite, Steuerberatung, Über mich, Impressum und Datenschutz im Browser bei 360, 390, 768, 1024, 1440 und 1920 px auf horizontales Überlaufen geprüft. Mobilmenü, Tastaturbedienung, Formularvalidierung sowie lokal simulierte Erfolgs- und Fehlerantworten wurden kontrolliert. Screenshots liegen als gesonderte Aufgabenausgabe vor. Dies sind keine gemessenen Core Web Vitals und kein echter EmailJS-Zustelltest. Details zur Referenz, Umsetzung und Freigabe: `docs/PREMIUM-REDESIGN.md`.

Vor öffentlicher Freigabe sind Firmen-/Kontaktdaten, Biografie, Leistungsdetails, Logo-Rechte und Rechtstexte durch F-Tax zu bestätigen. Die Lohnverrechnung bleibt ausdrücklich als Leistung eines Kooperationspartners bezeichnet.
