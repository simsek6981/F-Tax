# F-Tax: mobile Überarbeitung

Modus: Redesign · Preserve. Steuerberatung für Unternehmen und Privatpersonen; ruhige, sachliche Typografie und geometrische Anschnitte bleiben erhalten. Die Seite soll am Smartphone schnell lesbar sein und direkt zur Kontaktaufnahme führen.

Design Read: Varianz 2/10 (bestehende Anordnung), Bewegung 2/10 (mobil Zustandsfeedback), Informationsdichte 5/10 (kompaktere Abstände, freiwillige Formularangaben aufklappbar), Asset-Abhängigkeit 4/10 (vorhandene Fotos), Markentreue 10/10.

- Logo: `assets/icons/logo.png`, direkt aus der bereitgestellten Grafik; nur der weiße Außenrand wurde gekürzt. Unveränderte Referenz: `assets/icons/logo-reference.png`. Symbolausschnitt für das Favicon: `assets/icons/favicon.png`. Keine nachgesetzte Schrift; weiße transparente Maske im Footer.
- Hero-Porträt: `assets/images/ferhat-yilmaz.png` ist die unveränderte PNG-Originaldatei. Transparente WebP-Abstufungen `ferhat-yilmaz-640.webp` und `ferhat-yilmaz-1149.webp`; Darstellung mit `object-fit: contain`, ohne Anschnitt oder Farbfilter.
- Fotos: `assets/images/library.webp` und `library-640.webp`, `consultation.webp` und `consultation-640.webp`.
- Schrift: lokale Manrope in `assets/fonts/manrope-latin.woff2`, vorhandene Segoe-UI/Arial-Textschrift.
- Farben: Schiefergrau `#222a35`, Weiß `#fff`, Hellgrau `#f1f3f6`, Stahlblau `#3c6895`, dunkler Akzent `#2f5a86`.
- Mobil: 16 px Seitenrand, 8/16/24/32/48 px Abstände, 16–18 px Fließtext, mindestens 44 px für eigenständige Bedienelemente. Eckige Flächen, bestehende Rahmen und Schatten.
- Desktop und Mobil verwenden dieselben Markenfarben. Vergleichsbilder werden bei 1440 px aufgenommen.
- Geschützt: Seiten/Anker, Ich-Form, Logo über Firmenname, Formularfelder und EmailJS-Vertrag, Rechtstexte und Metadaten.
- Höchstes Risiko: schmale Headerzeile und Kontaktformular; Prüfung bei 320/375/390/430/768 px mit Touch-Eingabe, Tastatur und simulierten Versandantworten.

## Überarbeitung
Redesign · Preserve: textorientierter Startseiten-Hero, fünf Leistungsbereiche, Originalporträt auf Über mich. Schiefergrau und Stahlblau sowie lokale Manrope bleiben. Weiße Footer-Variante verwendet die Originalpixel als SVG-Transparenzmaske. Kontaktmenü entfernt; Terminformular und rechtliche Seiten bleiben. Visuelle Varianz 3/10, Bewegung 2/10, Informationsdichte 6/10, Bildabhängigkeit 3/10, Markentreue 10/10.
