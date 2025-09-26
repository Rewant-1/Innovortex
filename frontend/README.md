# EcoImpactApp Frontend

Next.js App Router UI that feels like a production-ready climate tech platform. Everything runs on sandbox data so you can demo confidently without external APIs.

## Highlights

- **Command Center** (`/`): launch the carbon workflow, view simulated Gemini attempts, and inspect the suggested playbook.
- **Offset Marketplace** (`/marketplace`): curated sample projects with pricing, SDG badges, and a staged checkout call-to-action.
- **AI Playbooks** (`/playbooks`): Gemini + RAG strategy cards explaining how mitigation plans would be executed.
- **Executive Mode** (`/executive`): investor-ready summary with staged KPIs and storytelling prompts.
- **API logger**: `/api/result` writes results to `.ecoimpact/results.log` so the backend “post result” step succeeds.

## Getting started

```powershell
cd frontend
npm install
npm run dev
```

The app expects the backend at `http://localhost:8000`. Override with:

```powershell
$env:NEXT_PUBLIC_BACKEND_URL="https://your-backend-url"
npm run dev
```

## Pages

| Route | Purpose |
| --- | --- |
| `/` | Forecast launcher with scenario presets, emissions/weather cards, Gemini attempt timeline, and playbook. |
| `/marketplace` | Sandbox offset marketplace showcasing monetisation potential. |
| `/playbooks` | AI mitigation strategies + RAG explainer grid. |
| `/executive` | Executive snapshot with wins, focus areas, and a storytelling script. |

## API helpers

`src/lib/api.js` exposes `BACKEND_URL` and a helper you can reuse once you add real endpoints.

## Deployment

Because the frontend is static + API routes:

1. **Build**

   ```powershell
   npm run build
   npm run start # Optional local smoke test
   ```

2. **Host choices**
   - **Vercel**: zero-config, just set `NEXT_PUBLIC_BACKEND_URL` in project settings.
   - **Netlify / Render**: use the same build command (`npm run build`) and serve `.next` output.

3. **Backend connection**
   - Point `NEXT_PUBLIC_BACKEND_URL` at the deployed FastAPI service.
   - If the backend is on a different origin, ensure CORS allows the frontend domain (already handled in the backend defaults).

### Deploying backend + frontend separately

- Deploy the sandbox FastAPI service (Render/Fly.io/Azure Container Apps) listening on `/:8000`.
- Deploy the Next.js app (Vercel/Netlify). Set `NEXT_PUBLIC_BACKEND_URL` to the backend public URL.
- Optional: run `npm run build && npm start` locally as a smoke test before shipping.

## Extending later

- Swap the sandbox endpoints for real APIs by updating `app/main.py`.
- Wire Stripe Checkout or other payment provider for a live marketplace flow.
- Replace fallback arrays with data from a database or CMS for stakeholder-ready launches.
