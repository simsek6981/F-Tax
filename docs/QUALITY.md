# Qualitätssicherung · Premium Redesign 2.0

Die vorhandenen Python-Prüfungen validieren Seiten, semantische Struktur, Links/Anker, Komponenten, Metadaten, Schema, Formularvertrag, Indexierungsumschaltung und Paketierung. Die 19 JavaScript-Tests prüfen EmailJS- und Motion-/Navigationsverhalten.

Die vorhandene Browser-/WCAG-CI bleibt erhalten. Ihre Mobilmenüsuche verwendet den stabilen Klassen-Selektor, da der zugängliche Name jetzt zwischen „Menü öffnen“ und „Menü schließen“ wechselt. Sie prüft 30 Größenkombinationen, Navigation, simulierte EmailJS-Antworten, reduzierte Bewegung, Alt-URLs, verschachtelte 404 und die Darstellung ohne JavaScript. Axe prüft die fünf Inhaltsseiten bei 390 und 1440 Pixeln; die CSS-Prozesslinie hat einen Scroll-Timeline-Test.

In der lokalen Browserprüfung wurden alle fünf Inhaltsseiten bei 360, 390, 768, 1024, 1440 und 1920 Pixeln kontrolliert. Je Test wurde auch geprüft, dass die tatsächliche Viewportbreite der angeforderten Breite entspricht. Keine Kombination hatte horizontales Überlaufen. Mobilmenü/Escape, aktive Links, Formularvalidierung und lokal simulierte Erfolgs-/Fehlerantworten wurden betrachtet. Keine echte E-Mail wurde versandt.

Dies sind keine unter realem Besucherverkehr gemessenen Core Web Vitals und kein Zustellnachweis. Details und Quellen: [Premium-Redesign](PREMIUM-REDESIGN.md).
