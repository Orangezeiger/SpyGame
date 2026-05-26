# SpyGame

SpyGame ist ein Multiplayer-Partyspiel mit Java, Spring Boot und einem schlanken Web-Frontend.  
Alle Spieler bekommen ein gemeinsames Wort, eine oder mehrere Personen sind die Imposter und kennen das Wort nicht. Ziel ist es, die Imposter zu entlarven, bevor sie sich durchbluffen.

## Features

- Lobby erstellen und per Code beitreten
- Optional passwortgeschützte Lobbys
- Host-System mit automatischer Host-Übergabe
- Mehrere Imposter je nach Spieleranzahl
- Konfigurierbare Spielzeit
- Zufällige Rollenzuweisung
- Randomizer für den Startspieler
- Kategorien für Wortpools
- Eigene Kategorien und eigene Wörter pro Benutzer
- Registrierung und Login
- Freundesliste mit Freundschaftsanfragen
- Online-Status von Freunden
- Direkt sehen, wenn Freunde gerade eine Lobby hosten
- Minimalistisches responsives Frontend für Desktop und Mobile

## Tech Stack

### Backend
- Java
- Spring Boot
- Spring Web
- Spring Data JPA
- Spring Security
- Maven

### Frontend
- HTML
- CSS
- Vanilla JavaScript

### Datenbank
- PostgreSQL

### Hosting
- Sowohl PostgreSQL als auch die Spring Boot App läuft auf einem Homelab

## Spielablauf

1. Ein Spieler erstellt eine Lobby.
2. Weitere Spieler treten per Lobbycode bei.
3. Der Host kann:
   - Spielzeit festlegen
   - Imposter-Anzahl festlegen
   - Kategorie auswählen
   - optional ein Lobby-Passwort setzen
4. Beim Spielstart:
   - normale Spieler erhalten ein Wort
   - Imposter erhalten kein Wort
5. Nach Ablauf des Timers kann der Host die Imposter aufdecken oder eine neue Runde starten.

## Regeln für Imposter

- Mindestanzahl Spieler zum Start: `3`
- Bei `3-4` Spielern: maximal `1` Imposter
- Ab `5` Spielern: maximal `2` Imposter
- Ab `7` Spielern: maximal `3` Imposter

## Benutzerfunktionen

Angemeldete Benutzer können:

- eigene Kategorien erstellen
- eigene Wörter hinzufügen
- Freunde per Benutzername hinzufügen
- Freundschaftsanfragen annehmen oder ablehnen
- sehen, ob Freunde online sind
- sehen, ob Freunde gerade eine Lobby hosten

## Projektstruktur

```text
spygame/
├── src/main/java/com/spygame/
│   ├── config/
│   ├── controller/
│   ├── dto/
│   ├── model/
│   ├── repository/
│   └── service/
├── src/main/resources/
│   ├── static/
│   │   ├── index.html
│   │   ├── style.css
│   │   └── script.js
│   └── application.properties
└── pom.xml
