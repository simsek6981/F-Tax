# Bestandsanalyse · 15.10.2026

Ausgangspunkt: Commit 74e15cc, mit vollständiger Git-Historie geklont. docs/WEBSITE-PLAN.md vor Änderungen vollständig gelesen. Kein AGENTS.md vorhanden.

## Bestand und Inhaltsgrenzen

Neun aktive Root-Seiten plus 404, CSS/JS, SVG-Favicon, Mailvorlage/-vorschau, Dokumentation, Konfiguration, Tests und Werkzeuge wurden untersucht. Keine Fotos oder bestätigte Logo-Datei vorhanden.

Bekannte Angaben: F-Tax Steuerberatung GmbH, Leonding; FN 655274p, Landesgericht Linz, UID ATU82256979. Keine weiteren Unternehmensdaten angenommen.

Steuerberatung umfasst Einkommen-, Körperschaft- und Umsatzsteuer, Steuererklärungen, Vertretung vor dem Finanzamt, Rechtsformwahl und Umgründungen. Buchhaltung umfasst Finanzbuchhaltung und Einnahmen-Ausgaben-Rechnung. Lohnverrechnung umfasst Abrechnung und Meldungen, auch grenzüberschreitend. Bilanzierung umfasst Jahresabschlüsse und Bilanzen. Die zuvor entfernte Prozessoptimierung wird nicht wieder aufgenommen.

## Befunde und Änderungen

| Befund | Umsetzung |
| --- | --- |
| Startseite stark text-/listenorientiert | Eigene Bildwelt, Leistungskarten, Unternehmensabschnitt und Beratungsablauf |
| Leistungen-Menü führte nur zur Steuerberatung | Direktes Untermenü mit allen vier Dienstleistungen |
| Gemeinsame Elemente manuell dupliziert | Zentrale Komponenten und CI-Abgleich |
| Wenige thematische Visualisierungen | Themenkarte, Belegablauf, Monatszyklus, Abschlussgrafik |
| Fehlende FAQ bei Buchhaltung/Bilanzierung | Konkrete Vorbereitungs- und Übergabefragen |
| Keine vorherige Browserprüfung | Responsive Browser- und Interaktionsprüfungen |
| Root-Deployment liefert auch interne Unterlagen | Allowlist-Paketierung und vorbereiteter Pages-Workflow |
| Unvollständige Rechts-/Kontaktangaben | Deutliche Entwurfskennzeichnung und noindex erhalten |

Keine privaten Schlüssel gefunden. EmailJS-Public-Key und Service-/Template-IDs sind öffentliche Client-Konfiguration. Keine Abhängigkeiten hinzugefügt. Die bestehende Formularintegration wird weiterverwendet.
