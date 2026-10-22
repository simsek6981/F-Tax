# Qualitätssicherung · F-Tax

Die vorhandenen Python-Prüfungen validieren Seiten, semantische Struktur, Links/Anker, Komponenten, Metadaten, Schema, Formularvertrag, Indexierungsumschaltung und Paketierung. Die 20 JavaScript-Tests prüfen EmailJS- und Motion-/Navigationsverhalten einschließlich des Wechsels zwischen Smartphone und Desktop.

`npm run test:ui` startet eine lokale Python-Vorschau auf einem freien Port und führt nacheinander die drei vorhandenen bzw. erweiterten Browserprüfungen aus. Der Server wird auch bei fehlgeschlagenen Tests beendet. Ist `FTAX_BASE_URL` gesetzt, wird die dort bereits laufende Vorschau verwendet. Playwright-Chromium wird bevorzugt; unter Windows dient vorhandenes Edge als Alternative. Browser-Plugin in dieser Sitzung nicht verfügbar; Prüfung mit dem bestehenden Playwright-Workflow.

- `npm run test:browser`: fünf Inhaltsseiten bei 360, 390, 768, 1024, 1440 und 1920 px; 30 Kombinationen, bestehende Weiterleitungen, 404, Tastatur, Inhalt, Logo, Kontaktformular und reduzierte Bewegung.
- `npm run test:mobile`: sechs Seiten einschließlich 404 bei 320, 375, 390, 430 und 768 px; Touch-Eingabe mit zweifacher Pixeldichte. Prüft 30 Layouts auf Überlauf und mindestens 44 px große eigenständige Touch-Ziele. Je Breite werden Menü, Leistungsanker, Kontakt, Pflichtfeldfehler, freiwillige Angaben, Werterhalt, Versandfehler, erneutes Absenden, Erfolg, Themenlinks und Darstellung ohne JavaScript getestet. Smartphones laden die vorhandenen 640-px-Bilder.
- `npm run test:a11y`: 30 Axe-Prüfungen über fünf Inhaltsseiten bei 320, 375, 390, 430, 768 und 1440 px, mit geöffneten freiwilligen Formularfeldern.

Der Vorher-/Nachher-Vergleich der fünf Inhaltsseiten bei 1440 px verwendet dieselbe Browserkonfiguration mit reduzierter Bewegung. Die Desktop-Screenshots waren nach der mobilen Überarbeitung pixelgleich. Screenshots und JSON-Protokolle werden separat ausgegeben; der Standardordner ist `output/playwright/` (über `FTAX_QA_DIR` änderbar). Keine echte E-Mail wurde versandt.

Dies sind keine unter realem Besucherverkehr gemessenen Core Web Vitals und kein Zustellnachweis. Details und Quellen: [Premium-Redesign](PREMIUM-REDESIGN.md).
