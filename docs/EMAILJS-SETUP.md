# EmailJS · Premium Redesign 2.0

Die vorhandenen öffentlichen Kennungen bleiben erhalten: Service `service_ja02fgi`, Template `template_tk14gwp`, Public Key `VaQ_PnlLN756oJY4H`. Die Versandlogik in `assets/js/contact.js` nutzt die REST-API und übermittelt kein frei wählbares Empfängerpostfach und keinen privaten Schlüssel.

Das neue Template liegt unter `assets/email-templates/contact-notification.html`. Es wurde nicht im Live-Dashboard eingesetzt. Die Tests haben ausschließlich simulierte Antworten verwendet und keine echten E-Mails versandt.

## Im Dashboard ausführen

1. **Email Templates → template_tk14gwp → Code Editor / HTML** öffnen.
2. Den vollständigen Inhalt von `assets/email-templates/contact-notification.html` einsetzen.
3. Subject: `F-Tax Terminanfrage: {{topic}}`.
4. From Name: `F-Tax Website`; From Email: die Standardadresse des verbundenen E-Mail-Dienstes.
5. To Email: das bestätigte Kanzleipostfach fest eintragen; `office@f-tax.at` aus den Unternehmensunterlagen ist vor Betrieb zu bestätigen.
6. Reply To: `{{reply_to}}`.
7. Speichern, dann von der tatsächlichen HTTPS-Seite eine freigegebene Testanfrage senden. Dienstannahme, Postfacheingang, Reply-To, leere optionale Angaben und eine mehrzeilige Nachricht kontrollieren.

## Variablen

| Variable | Inhalt |
| --- | --- |
| `{{from_name}}` | Name, erforderlich |
| `{{from_email}}` | E-Mail, erforderlich |
| `{{reply_to}}` | Dieselbe Besucheradresse für Antworten |
| `{{phone}}` | Telefon, optional |
| `{{company}}` | Unternehmen, optional |
| `{{topic}}` | Anliegen, Standard „Erstgespräch“ |
| `{{appointment}}` | Terminwunsch, optional, bis 160 Zeichen |
| `{{message}}` | Nachricht, optional, bis 4.000 Zeichen |

Doppelte Klammern werden laut EmailJS standardmäßig escaped; inverse Abschnitte zeigen „Nicht angegeben“ für leere optionale Felder. Die Nachricht erhält Zeilenumbrüche mit `white-space:pre-wrap`. Tabellen und Inline-CSS, Arial als lokale Systemschrift, keine Animationen oder externen Bilder. Die Gestaltung wurde im Browser angesehen; die tatsächliche Darstellung in einzelnen E-Mail-Programmen ist offen.

`python tools/email-preview.py` erzeugt `docs/contact-notification-preview.html` mit ausdrücklich fiktiven Beispieldaten. Diese Vorschau nicht als Live-Template verwenden.

Nur Name und E-Mail sind Pflichtfelder. Die Website prüft Eingaben vor dem Versand, sperrt während des Versands weitere Anfragen, verhindert unmittelbare Wiederholungen und erhält Eingaben bei Fehlern. Eine Dienstannahme ist keine feste Terminbestätigung und kein Nachweis des Postfacheingangs. Es gibt keinen eingebetteten Verfügbarkeitskalender.

Die bestehenden Datenschutztexte beschreiben diesen technischen Ablauf, bleiben aber rechtliche Entwürfe. Konkrete Dienste, Vertragsgrundlagen, Empfänger und Aufbewahrung müssen für den tatsächlichen Betrieb bestätigt werden. Es wird keine kostenpflichtige Erweiterung vorausgesetzt.

## Abgeglichene offizielle Dokumentation

- [EmailJS REST /send](https://www.emailjs.com/docs/rest-api/send/)
- [Dynamische Variablen, Escaping und Bedingungen](https://www.emailjs.com/docs/user-guide/dynamic-variables-templates/)

Technischen Parametervertrag und Template-Syntax am 16.10.2026 abgeglichen; kein Dashboardzugriff und keine unabhängige Prüfung der Kontokonfiguration.
