# Developer Guide

This guide is for contributors working on the plugin source code.

---

## Tech Stack

- **Strapi v5** plugin architecture
- **TypeScript** (admin + server)
- **React** + Strapi Design System v2 for the admin UI
- **Vite** via `strapi-plugin build` for bundling
- **yalc** for local development linking

---

## Project Structure

```
├── admin/src/
│   ├── index.ts               # Plugin registration (menu link, settings section)
│   ├── pluginId.ts            # Plugin ID constant
│   ├── pages/
│   │   ├── HomePage.tsx       # Deployments list + Deploy button
│   │   └── SettingsPage.tsx   # Read-only config display
│   ├── hooks/
│   │   ├── useDeployAvailability.ts   # Checks if hook/token are configured
│   │   └── useDeployments.ts          # Fetches + polls deployment list
│   ├── components/
│   │   └── PluginIcon.tsx     # Sidebar icon
│   └── translations/
│       └── en.json            # i18n strings
├── server/src/
│   ├── index.ts               # Server plugin registration
│   ├── controllers/
│   │   ├── deploy.ts          # runDeploy, getDeployments, deployAvailability
│   │   └── config.ts          # Returns plugin config to admin
│   ├── services/
│   │   └── deploy.ts          # Vercel API calls (axios)
│   └── routes/
│       └── admin.ts           # 4 admin-only routes
└── docs/
    └── DEVELOPMENT.md         # This file
```

---

## Local Development Setup

### Prerequisites

- Node.js 18+
- A Strapi v5 project to test against
- [yalc](https://github.com/wclr/yalc) installed globally:
  ```bash
  npm install -g yalc
  ```

### First-time setup

**1. Install dependencies in the plugin:**
```bash
npm install --legacy-peer-deps
```

**2. Build and publish to the local yalc store:**
```bash
npm run build
yalc publish
```

**3. In your Strapi project, add the plugin via yalc:**
```bash
yalc add @nomadprogrammer/strapi-plugin-vercel-deploy
npm install --legacy-peer-deps
```

**4. Register the plugin in `config/plugins.js`:**
```js
module.exports = ({ env }) => ({
  'vercel-deploy': {
    enabled: true,
    config: {
      deployHook:  env('VERCEL_DEPLOY_PLUGIN_HOOK'),
      apiToken:    env('VERCEL_DEPLOY_PLUGIN_API_TOKEN'),
      appFilter:   env('VERCEL_DEPLOY_PLUGIN_APP_FILTER', ''),
      teamFilter:  env('VERCEL_DEPLOY_PLUGIN_TEAM_FILTER', ''),
      roles:       env.array('VERCEL_DEPLOY_PLUGIN_ROLES', []),
    },
  },
});
```

**5. Build the Strapi admin panel and start:**
```bash
npm run build
npm start
```

---

## Development Iteration Workflow

After making changes to the plugin source:

```bash
# 1. In the plugin directory — build and push:
npm run build
yalc push

# 2. In the Strapi project directory:
#    Only needed when admin/UI files changed:
npm run build
#    Then restart Strapi
npm start
```

> **Tip:** If only server-side files changed (controllers, services, routes), you can skip `npm run build` in the Strapi project and just restart Strapi.

---

## API Routes

All routes are admin-only (`admin::isAuthenticatedAdmin`):

| Method | Path                              | Description                        |
|--------|-----------------------------------|------------------------------------|
| GET    | `/vercel-deploy/deploy/run`       | Trigger a new Vercel deployment    |
| GET    | `/vercel-deploy/deploy/list`      | Fetch deployment list from Vercel  |
| GET    | `/vercel-deploy/deploy/availability` | Check if hook/token are set     |
| GET    | `/vercel-deploy/config`           | Return plugin config to admin UI   |

---

## Polling Behaviour

- On page load, `useDeployments` fetches the list once.
- After clicking **Deploy**, `usePolling` is set to `true` → fetches every 3 seconds.
- When all deployments reach a final state (`READY`, `ERROR`, `CANCELED`), `onDeploymentsFetched(false)` is called → polling stops.
- On any API error, polling stops immediately and the error state is shown.
- Uses a stable `useRef`-based fetch pattern to avoid the infinite re-render loop caused by `useFetchClient` returning a new `get` reference on every render.

---

## Environment Variables for Testing

Add to `.env` in your Strapi project:

```env
VERCEL_DEPLOY_PLUGIN_HOOK=https://api.vercel.com/v1/integrations/deploy/prj_xxx/yyy
VERCEL_DEPLOY_PLUGIN_API_TOKEN=your_vercel_api_token
VERCEL_DEPLOY_PLUGIN_APP_FILTER=my-nextjs-app
VERCEL_DEPLOY_PLUGIN_TEAM_FILTER=team_xxxxxxxxxxxxxxxxxxxx
VERCEL_DEPLOY_PLUGIN_ROLES=strapi-super-admin
```

---

## Publishing

```bash
npm run build
npm publish --access public
```
