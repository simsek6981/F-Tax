# Skills für Yilmaz

Die gewünschte Quelle ist https://github.com/openai/skills. Das Repository ist inzwischen als veraltet markiert; die offizielle README verweist auf https://github.com/openai/plugins für aktuelle Beispiele.

## Sinnvoller Einsatz

| Skill | Einsatz im Projekt | Aktueller Stand |
| --- | --- | --- |
| Sites | Website-Grundlage und private Vorschau | Verfügbarer Sites-Skill genutzt; Bereitstellung blockiert |
| playwright | Smartphone-/Desktop-Darstellung, Menü und Dialoge prüfen | Offizielle Anleitung gelesen, Installation und Ausführung noch nicht erfolgt |
| gh-fix-ci | Später fehlgeschlagene GitHub-Actions-Prüfungen untersuchen | Anleitung geprüft; derzeit kein Anwendungsfall und kein angemeldetes `gh` |

Die Skills sind Anleitungen für Codex. Sie werden nicht als Funktionen in den Browsercode eingebaut. Es wurden keine zusätzlichen Skills installiert. Das Klonen von `openai/skills` scheiterte an der lokalen Netzwerkverbindung. Beide verfügbaren Browsersteuerungswege konnten nicht starten. Eine Browserprüfung wurde deshalb nicht durchgeführt.

## Installation bei funktionierender Codex-Verbindung

In Codex mit verfügbarem Skill Installer:

```text
$skill-installer install https://github.com/openai/skills/tree/main/skills/.curated/playwright
```

Alternativ die aktuelle Plugin-Variante aus OpenAIs Plugin-Katalog wählen. Bereits verfügbare Skills nicht doppelt installieren. Anschließend in einer neuen Codex-Sitzung die Darstellung bei 1440 px, 768 px und 390 px sowie Navigation, Smartphone-Menü, Tastaturbedienung und Dialoge prüfen.

Für dieses statische Grundgerüst werden keine Datenbank-, Dokument-, Spiele- oder Trading-Skills benötigt.

## V2-Prüfung am 15.10.2026

Der bereits verfügbare Sites-Skill wurde für Gestaltung und lokale Vorschau genutzt. Die Browserprüfung war diesmal über den verfügbaren Browserzugang möglich; kein zusätzliches Playwright-Paket oder Skill installiert. Aktuelle Ergebnisse stehen in QUALITY.md. GitHub CLI ist lokal nicht angemeldet; der verbundene GitHub-Connector ist verfügbar.
