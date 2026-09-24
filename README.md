# AI Hub

Eine Chat-Oberfläche im Stil von Claude, die zwischen mehreren KI-Anbietern
(Anthropic Claude, OpenAI ChatGPT, Google Gemini) wechseln kann, ohne den
laufenden Chatverlauf zu verlieren. Praktisch, wenn bei einem Anbieter ein
Nutzungslimit erreicht wird: einfach auf einen anderen Anbieter umschalten
und mit vollem Kontext weiterarbeiten.

## Funktionsumfang

- **Provider-Fallback**: Schlägt eine Anfrage fehl (z. B. Rate-/Nutzungslimit),
  erscheint eine Fehlermeldung mit Buttons zum sofortigen Fortsetzen bei
  einem anderen konfigurierten Anbieter – der bisherige Verlauf wird
  automatisch mitgegeben.
- **Projekte**: Chats lassen sich in Projekten mit eigenem System-Prompt
  (Anweisungen) gruppieren; die Anweisungen gelten anbieterübergreifend.
- **Streaming-Antworten**, Markdown- und Code-Rendering, Stop-Button.
- **Lokale API-Keys**: Keys werden ausschließlich im Browser (`localStorage`)
  gespeichert. Es gibt keinen eigenen Server/Backend – die App spricht
  direkt aus dem Browser mit den offiziellen APIs der Anbieter.

## Setup

```bash
npm install
npm run dev
```

Beim ersten Start öffnen sich automatisch die Einstellungen, um mindestens
einen API-Key zu hinterlegen:

- Anthropic: https://console.anthropic.com/settings/keys
- OpenAI: https://platform.openai.com/api-keys
- Google: https://aistudio.google.com/apikey

## Build

```bash
npm run build
npm run preview
```

Da es sich um eine reine Client-Anwendung handelt, kann `dist/` nach dem
Build auf beliebigem statischen Hosting (oder auch nur lokal per
`npm run preview`) betrieben werden.

## Hinweis zu API-Keys im Browser

Die Keys verlassen deinen Rechner nur in Richtung der jeweiligen
Anbieter-API (direkter Browser-Request). Das ist bequem für den
Eigengebrauch, aber die Keys liegen im Klartext im `localStorage` des
Browserprofils – nicht auf einem gemeinsam genutzten/öffentlichen Rechner
verwenden.
