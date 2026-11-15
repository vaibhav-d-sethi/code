<<<<<<< HEAD
# Circuit Sages: Earth System Trend Detective (v2)

A website that lets anyone pick a city and a climate variable, see how it has changed since 1980,
and check whether the change is statistically significant. Data: NASA MERRA-2.

## Layout

- `backend/`  FastAPI service: data, statistics, the language-model pipeline, and the Earthdata compute jobs.
- `frontend/`      Next.js website with six pages: Home, Explore, Ask, Presets, Compute, Method.
- `scripts/`  Build the local city CSVs from downloaded MERRA-2 files.
- `data/`     Presets, and the city CSVs (created by the scripts; not committed).

## Run it locally

```bash
# 1. Backend
cp .env.example .env              # fill in GROQ_API_KEY and the Earthdata login
python -m venv .venv && .venv\Scripts\activate
pip install -r requirements.txt
python scripts/build_city_csv.py lucknow     # repeat for jaisalmer, kochi, shimla, leh
cd backend && uvicorn main:app --reload --port 8000

# 2. Website (new terminal)
cd frontend
cp .env.example .env.local
npm install
npm run dev                        # open http://localhost:3000
```

For the judges' build: `npm run build && npm start`.

## Two ways to get data

1. **Local** (default, fastest): the city CSVs built from downloaded MERRA-2 files.
2. **Compute an area** (Compute page): enter two opposite corners of a box, each side between 2° and 4°.
   The backend averages every MERRA-2 grid cell in the box, month by month, reads it from NASA Earthdata,
   and saves it as `data/computed/area_<...>.csv`. Pins dropped on the home-page globe can fill the corners.
   Requires the Earthdata username and password in `.env`, and the MERRA-2 licence approved on earthdata.nasa.gov.

## Method (the standard we use)

Mann-Kendall trend test with Sen's slope, corrected for autocorrelation (Hamed and Rao, 1998).
The full references are on the Method page and in `backend/stats.py`.
The Welch t-test on the first and last decade is kept as a plain check.

## Three-day forecast

The Explore page shows a 2 to 3 day forecast for the chosen city, from Open-Meteo
(`backend/weather.py`). It needs no API key. Results are cached for 30 minutes.
The forecast is separate from the statistics and never feeds the trend tests.

## The 3D globe

The home page globe is CesiumJS. Add a free token from https://ion.cesium.com to `frontend/.env.local` as
`NEXT_PUBLIC_CESIUM_TOKEN=`. Click the globe to drop up to five named pins. Each pin shows its coordinates and
the distance from the previous pin.

## Notes

- Statistics are computed in Python. The language model only writes the plan and the explanation.
- Keys belong in `.env` only. Rotate any key that was ever pasted into a chat.
- Photos: see `frontend/public/photos/README.md`. Until they are added, the site shows built-in artwork.
- Deploy: put the backend on Render and the `frontend` folder on Vercel, then set `NEXT_PUBLIC_API_URL`
  to the backend URL and add the Vercel address to `CORS_ORIGINS`.
=======
# code
>>>>>>> d316b0f6a5824b897df2c987c1c8c5c97ad68e82
