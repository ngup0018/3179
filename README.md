# FIT3179 Project (publish)

This repository contains the cleaned project ready for GitHub Pages.

Contents
- index.html — dashboard page with Vega visualizations
- js/ — Vega specs for the map and chart
- data/ — small CSV and JSON needed for the page
- Large spatial files (GeoJSON & shapefile components) are tracked via Git LFS and present in this repo.

Notes
- GitHub Pages: enable Pages in repository Settings → Pages → Source: `main` branch, folder `/ (root)`.
- Pages URL (after enabling): `https://ngup0018.github.io/3179`

Git LFS
- This repo uses Git LFS for large spatial files (data/abs_sa2_boundaries.geojson and SA2_2021_AUST_GDA2020.*).
- Monitor LFS usage in repo Settings → Code and automation → LFS.

If Pages build fails:
- Confirm `index.html` is at repository root and contains relative paths to `js/` and `data/`.
- Check Actions/Pages logs in repo Settings.

If you want me to enable Pages via the API, generate a new GitHub Personal Access Token (minimal `repo` scope), then run the curl command I provide locally (do NOT paste tokens in chat).

---
If you need any changes to the visualization or assets, tell me which file to edit next.
