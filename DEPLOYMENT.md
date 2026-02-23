# Virelle Studios — Railway Deployment & Domain Setup

## Prerequisites

- A [Railway](https://railway.app) account
- The GitHub repository `leego972/virellestudios` (or your fork)
- Access to GoDaddy DNS for the `Virelle.life` domain

---

## Step 1: Deploy to Railway

1. Go to [railway.app](https://railway.app) and sign in.
2. Click **New Project** → **Deploy from GitHub repo**.
3. Select the `leego972/virellestudios` repository.
4. Railway will auto-detect the `Dockerfile` and `railway.toml`.

### Add a Database

5. In your Railway project, click **New** → **Database** → **MySQL** (or **PostgreSQL** if you switch the driver).
6. Railway will provision the database and inject `DATABASE_URL` automatically.

### Set Environment Variables

7. Go to your service **Variables** tab and add:

| Variable | Description |
|---|---|
| `DATABASE_URL` | Auto-injected by Railway MySQL plugin |
| `JWT_SECRET` | A random 64-character string for signing tokens |
| `OAUTH_SERVER_URL` | Your OAuth provider base URL |
| `VITE_APP_ID` | Your Manus OAuth application ID |
| `VITE_OAUTH_PORTAL_URL` | Manus login portal URL |
| `PORT` | Railway sets this automatically; the app reads it |

> **Tip:** Generate a secure JWT secret with: `openssl rand -hex 32`

### Deploy

8. Railway will build and deploy automatically on every push to the `main` branch.
9. Once deployed, Railway provides a default URL like `virellestudios-production.up.railway.app`.

---

## Step 2: Connect Virelle.life Domain (GoDaddy)

### In Railway

1. Open your deployed service in Railway.
2. Go to **Settings** → **Networking** → **Custom Domain**.
3. Click **Add Custom Domain** and enter: `virelle.life`
4. Railway will show you a **CNAME target** (e.g., `cname.railway.app` or similar).
5. Optionally, also add `www.virelle.life` as a second custom domain.

### In GoDaddy

1. Log in to [GoDaddy](https://www.godaddy.com) and go to **My Products** → **DNS** for `Virelle.life`.
2. Add or edit the following DNS records:

#### For the root domain (`virelle.life`):

| Type | Name | Value | TTL |
|---|---|---|---|
| CNAME | @ | `<Railway CNAME target>` | 600 |

> **Note:** Some DNS providers don't allow CNAME on the root domain. If GoDaddy doesn't support this, use an **A record** instead. Railway's documentation provides the IP addresses for A records. Alternatively, you can use Cloudflare as a proxy (free tier) which supports CNAME flattening on root domains.

#### For `www.virelle.life`:

| Type | Name | Value | TTL |
|---|---|---|---|
| CNAME | www | `<Railway CNAME target>` | 600 |

3. Save the DNS records.
4. Wait 5–30 minutes for DNS propagation.

### Verify in Railway

5. Go back to Railway → **Settings** → **Custom Domain**.
6. Railway will show a green checkmark once DNS is verified.
7. Railway automatically provisions an SSL certificate (HTTPS) for your domain.

---

## Step 3: Verify Deployment

1. Visit `https://virelle.life` in your browser.
2. You should see the Virelle Studios login/landing page.
3. Test the OAuth login flow.
4. Create a test project to verify database connectivity.

---

## Troubleshooting

### DNS not resolving
- DNS changes can take up to 48 hours to propagate globally, but typically resolve within 30 minutes.
- Use [dnschecker.org](https://dnschecker.org) to verify propagation.

### Build fails on Railway
- Check the Railway build logs for errors.
- Ensure all environment variables are set correctly.
- Verify the `Dockerfile` builds successfully locally: `docker build -t virelle .`

### Database connection issues
- Ensure `DATABASE_URL` is correctly set in Railway variables.
- If using Railway's MySQL plugin, the URL is auto-injected.
- Check that the database service is running in your Railway project.

### SSL certificate pending
- Railway auto-provisions SSL certificates via Let's Encrypt.
- This can take a few minutes after DNS verification.
- If it takes longer than 30 minutes, try removing and re-adding the custom domain.

---

## Architecture Notes

- **Frontend:** React + Vite (built to `dist/client/`)
- **Backend:** Express + tRPC (bundled to `dist/index.js`)
- **Database:** MySQL via Drizzle ORM
- **Storage:** S3-compatible storage for file uploads
- **Auth:** JWT-based with Manus OAuth integration
