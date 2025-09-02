## M4RC1L ImageGen

Next.js App Router project with an ImageGen tool:
- Text → Image (Hugging Face FLUX first, Stability fallback)
- Image → Image (Stability Stable Image API)
- Image → Text (Hugging Face BLIP)

UI: Tailwind + shadcn-style components.

### Prereqs
- Node 18+ (recommended 20+)
- pnpm or npm

### Setup
1) Copy env template and fill keys
```
cp .env.local.example .env.local
# set HF_TOKEN, STABILITY_API_KEY, optional STABILITY_MODEL
```
2) Install deps
```
npm install
```
3) Dev server
```
npm run dev
```
Open http://localhost:3000

### Build & start
```
npm run build
npm start
```

### Push to GitHub
Create a new repo first, then:
```
git init
git add -A
git commit -m "feat: initial"
git branch -M main
git remote add origin https://github.com/m4rc1ldev/M4RC1L-GEN-AI.git
git push -u origin main
```

### Deploy
- Vercel: import repo, set env vars (HF_TOKEN, STABILITY_API_KEY, STABILITY_MODEL)
- Any Node host: run build and start
