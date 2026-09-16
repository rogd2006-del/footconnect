# FootConnect

Mobile-first football turf finder and pickup-game app.

## Run locally

1. Install Node.js 20 or newer.
2. Run `npm install`.
3. Copy `.env.example` to `.env` and add rotated server-side keys.
4. Run `npm start` and open `http://localhost:3000`.

The API uses seeded data until a database, auth provider, maps service, and booking provider are connected. `GEMINI_API_KEY` is used only by the server for optional recommendations. Never expose API keys in frontend code or commit `.env`.

## API

- `GET /api/health`
- `GET /api/turfs`
- `GET /api/games`
- `POST /api/games`
- `POST /api/games/:id/join`
- `POST /api/recommendations`
# footconnect
bleh
