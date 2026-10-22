# Architektur · F-Tax Premium Redesign 2.0

Alle HTML-Seiten liegen im Root. Header und Footer werden statisch aus `components/` synchronisiert. Ein gemeinsames `assets/css/style.css` enthält Designsystem, responsive Regeln und CSS-Animationen. Es ist kein Build oder Framework zur Laufzeit nötig.

Referenzbilder liegen als WebP in zwei Größen in `assets/images/`, Manrope samt OFL-Lizenz in `assets/fonts/`. Bilder und Schrift werden vom selben Host ausgeliefert. Das ursprüngliche Markenlogo bleibt erhalten; es gibt kein erfundenes Porträt.

`main.js` erhält das Mobilmenü einschließlich Fokuswechsel, Escape und Desktopübergang. Scroll-Reveals unterscheiden Text, Zeilen und Bilder; Inhalte sind ohne JavaScript sichtbar. Der Headerhandler ist passiv und nutzt requestAnimationFrame. Reduzierte Bewegung beendet aktive Animationen. Eine dezente CSS View Timeline animiert die Prozesslinie auf Desktop; ältere Browser zeigen statische Linien.

`contact.js` und seine öffentlichen Kennungen bleiben unverändert. Nur Name und E-Mail sind Pflichtfelder. Validierung, Honeypot, Timeout, Doppelsendesperre, Cooldown und Zustandsmeldungen bleiben erhalten. EmailJS wird erst beim Absenden angesprochen. Das Empfängerpostfach ist fest im Dienst zu konfigurieren. Ohne JavaScript sind Navigation und direkte Kontaktmöglichkeiten sichtbar.

Bestehende Weiterleitungen, SEO-Metadaten, strukturierte Daten und Release-Umschaltung bleiben erhalten. Der aktuelle Modus ist weiterhin `preview`. Die öffentliche Paketierung enthält Root-Seiten, CSS, JS, Icons, Bilder und Fonts; interne Dokumentation und Mailvorlagen bleiben außerhalb des öffentlichen Pakets. `dist/` bleibt ignoriert.

Node-Abhängigkeiten sind ausschließlich für die vorhandene Browser-/WCAG-Qualitätsprüfung vorgesehen. Die CI des aktuellen Hauptzweigs bleibt erhalten. Vollständige Referenzanalyse, Prüfungen und offene Betriebspunkte stehen in `PREMIUM-REDESIGN.md`.
