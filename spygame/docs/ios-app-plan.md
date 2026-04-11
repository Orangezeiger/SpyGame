# SpyGame iOS Plan

## Ziel
Eine spaetere iOS-App soll **dieselbe Spring-Boot-API** nutzen wie das Web-Frontend.
Die App spricht **nicht direkt mit der Datenbank**. Die Datenbank bleibt nur fuer das Backend sichtbar.

## Architektur
- iOS App: SwiftUI
- Netzwerk: URLSession
- Backend: Spring Boot REST API
- Datenbank: dieselbe bestehende PostgreSQL-DB

## Warum nicht direkt DB-Zugriff
- sicherer
- Passwoerter und Spiellogik bleiben serverseitig
- Freunde, Kategorien, Stats und Lobby-Logik sind zentral an einer Stelle
- spaeter einfacher fuer Android/Web weiterverwendbar

## Bereits vorhandene Endpoints
- POST `/auth/register`
- POST `/auth/login`
- GET `/categories`
- POST `/categories`
- POST `/create-room`
- POST `/join-room`
- POST `/start-game`
- GET `/room-state`
- GET `/role`
- POST `/room-settings`
- POST `/leave-room`
- GET `/friends`
- POST `/friends/request`
- POST `/friends/respond`
- POST `/presence/ping`
- POST `/presence/offline`
- GET `/health`

## Geplante iOS Screens
1. Splash / Server Check
- ruft `/health` auf
- zeigt an, ob Backend erreichbar ist

2. Login / Register
- nutzt `/auth/login` und `/auth/register`
- speichert die Rueckgabe lokal in Keychain/UserDefaults

3. Home / Lobby Auswahl
- Raum erstellen
- Raum beitreten
- Freunde-Menue

4. Lobby Screen
- pollt `/room-state`
- zeigt Spieler, Kategorien, Timer-Einstellungen, Passwortstatus

5. Game Screen
- nutzt `/role`
- zeigt Rolle und Wort
- zeigt verbleibende Zeit lokal anhand von `startedAtEpochMillis`

6. Freunde Screen / Sheet
- GET `/friends`
- POST `/friends/request`
- POST `/friends/respond`

## Mobile-Risiken, die wir spaeter sauberer loesen sollten
### 1. Auth ist aktuell noch leichtgewichtig
Im Moment arbeitet das Projekt mit `userId` aus dem Login-Response. Das ist fuer den Protoyp okay, aber fuer eine echte App sollten wir spaeter auf **Token-basierte Authentifizierung** umstellen.

Empfohlener spaeterer Schritt:
- JWT oder Session Token einfuehren
- geschuetzte Endpoints an Token binden

### 2. Polling statt WebSocket
Aktuell ist die App-Logik polling-basiert. Das ist fuer Version 1 okay.

Spaeter moeglich:
- WebSocket/SSE fuer Lobby-Updates

### 3. Presence / Offline Detection
Aktuell ueber Ping + Timeout + best effort disconnect.
Das ist fuer mobile Apps okay als erste Version, aber nie zu 100% perfekt.

## Was wir schon vorbereitet haben
- kompakte, modalbasierte Flows fuer Login, Freunde und Kategorien
- `/health` Endpoint fuer App-Startchecks
- klare JSON-Fehlerantworten
- persistente Daten in PostgreSQL
- Freunde, Kategorien, Passwort-Lobbys, Presence

## Empfohlene Reihenfolge spaeter mit Xcode
1. SwiftUI App-Shell erstellen
2. APIClient bauen
3. Health Check auf App Start
4. Login/Register
5. Raum erstellen / beitreten
6. Lobby Polling
7. Freunde-Menue
8. Game Screen
9. spaeter Auth mit Token absichern
