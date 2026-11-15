# Deploy Circuit Sages

Three parts: the code on GitHub, the backend on Render, the frontend on Render.
Secrets (keys and passwords) go only into Render's environment settings, never into files.

## 1. Run it on your computer first (Cursor)

1. Open the project folder in Cursor (File > Open Folder).
2. Backend, in the Cursor terminal:
   ```
   cd backend
   copy ..\.env.example ..\.env        (Windows)  /  cp ../.env.example ../.env  (Mac/Linux)
   ```
   Open `.env` and fill in `GROQ_API_KEY`, `EARTHDATA_USERNAME`, `EARTHDATA_PASSWORD`.
   ```
   python -m venv .venv
   .venv\Scripts\activate          (Mac/Linux: source .venv/bin/activate)
   pip install -r requirements.txt
   uvicorn main:app --reload --port 8000
   ```
   Check http://localhost:8000/health shows `{"status":"ok"}`.
3. Frontend, in a second Cursor terminal:
   ```
   cd frontend
   copy .env.example .env.local    (Windows)  /  cp .env.example .env.local  (Mac/Linux)
   npm install
   npm run dev
   ```
   Open http://localhost:3000.

## 2. Put the code on GitHub

1. Create an empty repository on github.com, for example `circuit-sages`. Do not add a README there.
2. In the project folder:
   ```
   git init
   git add .
   git commit -m "Circuit Sages v6"
   git branch -M main
   git remote add origin https://github.com/<your-username>/circuit-sages.git
   git push -u origin main
   ```
3. Before the first push, check with `git status` that `.env` and `.env.local` are NOT listed.
   They are ignored by `.gitignore`. If a key was ever pasted into a chat or a file, rotate it on Groq and Earthdata.

## 3. Deploy the backend on Render

1. render.com > New > Web Service > connect your GitHub repo.
2. Settings:
   - Root Directory: `backend`
   - Runtime: Python 3
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
3. Environment variables (Advanced > Add):
   - `PYTHON_VERSION` = `3.11.9`
   - `GROQ_API_KEY` = your key
   - `GROQ_MODEL` = `openai/gpt-oss-120b`
   - `EARTHDATA_USERNAME`, `EARTHDATA_PASSWORD`
   - `CORS_ORIGINS` = your frontend URL, for example `https://circuit-sages-web.onrender.com`
     (no trailing slash; add `http://localhost:3000` too if you still test locally)
4. Deploy. Open `https://<backend>.onrender.com/health`. It must return `{"status":"ok"}`.
   Free Render services sleep after inactivity, so the first request can take about 30 seconds.

## 4. Deploy the frontend on Render

1. Render > New > Web Service > same repo.
2. Settings:
   - Root Directory: `frontend`
   - Runtime: Node
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
3. Environment variables. These are read at BUILD time, so set them before the first build:
   - `NODE_VERSION` = `20`
   - `NEXT_PUBLIC_API_URL` = `https://<backend>.onrender.com`
   - `NEXT_PUBLIC_CESIUM_TOKEN` = your token from ion.cesium.com (optional; without it the globe shows a message)
4. Deploy, then open the frontend URL.

If you change `NEXT_PUBLIC_API_URL` later, trigger a new build. Changing it alone does nothing.

## Alternative: frontend on Vercel

Import the repo on vercel.com, set Root Directory to `frontend`, add the same `NEXT_PUBLIC_*` variables, and deploy.
Then add the Vercel address to the backend's `CORS_ORIGINS`.

## Checklist of changes you need to make

- [ ] Fill in the keys in your local `.env` (never commit it).
- [ ] Copy `frontend/.env.example` to `frontend/.env.local` for local testing.
- [ ] Create the GitHub repo and push (step 2).
- [ ] Backend on Render: root `backend`, the start command above, and the env vars.
- [ ] Set `CORS_ORIGINS` on the backend to the frontend's URL.
- [ ] Frontend on Render: root `frontend`, and `NEXT_PUBLIC_API_URL` set to the backend URL before the first build.
- [ ] Add the Cesium token if you want the 3D globe on the live site.
- [ ] Rotate any key that was ever pasted into a chat.

## Troubleshooting

- "Cannot reach the data service": the backend is asleep or `NEXT_PUBLIC_API_URL` is wrong. Check `/health`.
- Browser console shows CORS error: `CORS_ORIGINS` on the backend does not match the frontend URL exactly.
- "The local data for ... is not on this computer yet": the `data/cities` folder was not pushed. Check that the `.gitignore` in this version has no `data/cities/` line.
- Forecast shows "not available": Open-Meteo could not be reached. Try again later.
