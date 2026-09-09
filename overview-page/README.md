# PrivaCraft Overview Landing Page

Official interactive landing page and defense workstation showcase for **PrivaCraft**.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fshorbornolabs%2Fprivacraft&root-directory=overview-page)

## Deploying on Vercel

### Option 1: 1-Click Deploy
Click the **Deploy with Vercel** button above. Vercel will automatically configure the root directory to `overview-page` and deploy in seconds.

### Option 2: Manual Import
1. Go to [Vercel Dashboard](https://vercel.com/dashboard) and click **Add New... > Project**.
2. Select repository `shorbornolabs/privacraft`.
3. In the project configuration:
   - **Root Directory:** Either leave as `./` (handled automatically by root `vercel.json`) or select `overview-page`.
   - **Framework Preset:** Other (Static Site).
4. Click **Deploy**.

## Features
- **Live RFC 6238 TOTP Monitor:** Synchronized 30-second circular countdown timer with dynamic code generator.
- **CSPRNG Password Studio:** Real-time entropy scoring (bits) and crack resistance projections.
- **Disposable Temp Mail Simulator:** Auto OTP extractor simulation.
- **Zero External Dependencies:** Built with pure HTML5, CSS3, and vanilla modern JavaScript.
