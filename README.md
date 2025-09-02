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

## Environment variables

Required
- HF_TOKEN: Hugging Face access token (txt→img + image captioning)
- STABILITY_API_KEY: Stability API key (img→img, inpaint, and fallback)

Optional
- STABILITY_MODEL: Defaults to sd3.5-large
- NEXT_PUBLIC_BASE_URL: Public site URL if needed (e.g., https://your-app.vercel.app)

Copy template
```
cp .env.local.example .env.local
```

## Deploy on Vercel (step by step)
1) Create a new project
	- Go to https://vercel.com/new
	- Import the repo m4rc1ldev/M4RC1L-GEN-AI
	- Framework preset: Next.js (auto-detected)
2) Configure build
	- Build Command: npm run build (default is fine)
	- Install Command: npm install (default)
	- Output: .next (default)
	- Node.js version: 20+ (Project Settings → General → Node.js Version)
3) Add Environment Variables (Project Settings → Environment Variables)
	- HF_TOKEN = your_hf_token
	- STABILITY_API_KEY = your_stability_key
	- STABILITY_MODEL = sd3.5-large (optional)
	- NEXT_PUBLIC_BASE_URL = https://<project-name>.vercel.app (optional after first deploy)
4) Deploy
	- Click Deploy
	- After first deploy, visit the URL and test /imagegen

Promoting previews
- Every git push creates a Preview deployment
- Use the Promote button to make it Production if desired

## Deploy on Render (step by step)
1) Create a Web Service
	- Go to https://dashboard.render.com
	- New → Web Service → Build and deploy from a Git repo
	- Connect GitHub and pick m4rc1ldev/M4RC1L-GEN-AI
2) Configure service
	- Environment: Node
	- Region: any close to you
	- Branch: main
	- Build Command: npm ci && npm run build
	- Start Command: npm start
	- Node version: 20 (Environment → Advanced → specify if needed)
3) Add Environment Variables (Service → Environment)
	- HF_TOKEN = your_hf_token
	- STABILITY_API_KEY = your_stability_key
	- STABILITY_MODEL = sd3.5-large (optional)
	- NEXT_PUBLIC_BASE_URL = public URL Render assigns (optional after first deploy)
4) Create Web Service
	- Wait for build logs to finish
	- Open the Live URL and test /imagegen

Tips
- Do not commit .env files; they’re already ignored by .gitignore
- If images fail to generate on Render due to memory, scale the instance or lower settings (strength/steps)
