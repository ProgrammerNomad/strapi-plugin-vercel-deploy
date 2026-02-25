# strapi-plugin-vercel-deploy

[![npm version](https://img.shields.io/npm/v/@nomadprogrammer/strapi-plugin-vercel-deploy.svg?style=flat-square)](https://www.npmjs.com/package/@nomadprogrammer/strapi-plugin-vercel-deploy)
[![npm downloads](https://img.shields.io/npm/dm/@nomadprogrammer/strapi-plugin-vercel-deploy.svg?style=flat-square)](https://www.npmjs.com/package/@nomadprogrammer/strapi-plugin-vercel-deploy)
[![license](https://img.shields.io/github/license/ProgrammerNomad/strapi-plugin-vercel-deploy?style=flat-square)](https://github.com/ProgrammerNomad/strapi-plugin-vercel-deploy/blob/main/LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/ProgrammerNomad/strapi-plugin-vercel-deploy?style=flat-square)](https://github.com/ProgrammerNomad/strapi-plugin-vercel-deploy/stargazers)
[![GitHub issues](https://img.shields.io/github/issues/ProgrammerNomad/strapi-plugin-vercel-deploy?style=flat-square)](https://github.com/ProgrammerNomad/strapi-plugin-vercel-deploy/issues)
[![strapi](https://img.shields.io/badge/strapi-v5-2F80ED?style=flat-square&logo=strapi)](https://strapi.io)
[![node](https://img.shields.io/node/v/@nomadprogrammer/strapi-plugin-vercel-deploy.svg?style=flat-square)](https://nodejs.org)

Trigger and monitor Vercel deployments directly from the Strapi Admin Panel.

This plugin connects your Strapi CMS workflow with Vercel deployments, allowing editors and developers to deploy frontend applications without leaving Strapi.

---

## Why This Plugin?

When using Strapi as a headless CMS with Next.js or other frontend frameworks hosted on Vercel, content updates often require manual deployments.

This plugin enables:

- CMS-driven deployments
- One-click frontend rebuilds
- Deployment monitoring inside Strapi
- Role-based deployment access

Perfect for Next.js + Strapi production workflows.

---

## Features

- Trigger Vercel deployments with one click
- Live deployment status polling
- Color-coded status badges:
  - READY (green)
  - BUILDING / QUEUED (orange)
  - ERROR / CANCELED (red)
- Direct links to deployment URL and Vercel Inspector
- Configuration visibility inside the admin panel
- Optional role-based access control

---

## Screenshots

**Dashboard**

![Dashboard](docs/images/dashboard.png)

**Deployment Status**

![Deployment Status](docs/images/deployment-status.png)

---

## Installation

Install the plugin inside your Strapi project:

```bash
npm install @nomadprogrammer/strapi-plugin-vercel-deploy
```

Restart Strapi after installation.

---

## Plugin Configuration

Create or update `config/plugins.js`:

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

---

## Environment Variables

Add these to your Strapi project's `.env` file:

```env
# Required
VERCEL_DEPLOY_PLUGIN_HOOK=https://api.vercel.com/v1/integrations/deploy/prj_xxx/yyy
VERCEL_DEPLOY_PLUGIN_API_TOKEN=your_vercel_api_token

# Optional
VERCEL_DEPLOY_PLUGIN_APP_FILTER=my-nextjs-app
VERCEL_DEPLOY_PLUGIN_TEAM_FILTER=team_xxxxxxxxx
VERCEL_DEPLOY_PLUGIN_ROLES=strapi-super-admin
```

| Variable                           | Required | Description                                      |
|------------------------------------|----------|--------------------------------------------------|
| `VERCEL_DEPLOY_PLUGIN_HOOK`        | Yes      | Vercel Deploy Hook URL                           |
| `VERCEL_DEPLOY_PLUGIN_API_TOKEN`   | Yes      | API token used to fetch deployments              |
| `VERCEL_DEPLOY_PLUGIN_APP_FILTER`  | No       | Filter deployments by project name               |
| `VERCEL_DEPLOY_PLUGIN_TEAM_FILTER` | No       | Required for Vercel team accounts                |
| `VERCEL_DEPLOY_PLUGIN_ROLES`       | No       | Allowed Strapi roles                             |

---

## Getting Your Vercel Credentials

### 1. Deploy Hook URL _(required)_

A Deploy Hook is a unique URL that triggers a new build when called. Keep it secret.

1. Open your project on [vercel.com/dashboard](https://vercel.com/dashboard).
2. Click **Settings** → **Git** → scroll to **Deploy Hooks**.
3. Enter a name (e.g. `Strapi CMS`) and select the branch (e.g. `main`).
4. Click **Create Hook** and copy the generated URL.
5. Set it as `VERCEL_DEPLOY_PLUGIN_HOOK` in your `.env`.

> Requires your project to be connected to a Git repository.
> Official docs: [vercel.com/docs/deploy-hooks](https://vercel.com/docs/deploy-hooks)

---

### 2. Vercel API Token _(required)_

1. Go to [vercel.com/account/settings/tokens](https://vercel.com/account/settings/tokens).
2. Fill in **TOKEN NAME**, set **SCOPE** to your team (or Full Account for personal), set **EXPIRATION** (recommended: `No Expiration`).
3. Click **Create** and **copy the token immediately** — it is only shown once.
4. Set it as `VERCEL_DEPLOY_PLUGIN_API_TOKEN` in your `.env`.

> Official docs: [vercel.com/docs/rest-api#authentication](https://vercel.com/docs/rest-api#authentication)

---

### 3. Project Name _(optional)_

The project name shown at the top of your Vercel dashboard (also visible in the URL: `vercel.com/<team>/<project-name>`).
Set as `VERCEL_DEPLOY_PLUGIN_APP_FILTER`. Leave empty to show all projects.

---

### 4. Team ID _(required for team accounts)_

1. Go to your team on [vercel.com/dashboard](https://vercel.com/dashboard).
2. Click **Settings** → **General**.
3. Copy the **Team ID** (starts with `team_`).
4. Set as `VERCEL_DEPLOY_PLUGIN_TEAM_FILTER`. Leave empty for personal accounts.

---

## Usage

1. Open the Strapi Admin Panel.
2. Navigate to **Vercel Deploy** in the side menu.
3. Click **Deploy** to trigger a new deployment.
4. Monitor deployment status live — no need to open Vercel separately.

---

## Compatibility

| Software | Version |
|----------|---------|
| Strapi   | v5+     |
| Node.js  | 18+     |
| Vercel   | API v6  |

---

## Development

Clone the repository and install dependencies:

```bash
git clone https://github.com/ProgrammerNomad/strapi-plugin-vercel-deploy
cd strapi-plugin-vercel-deploy
npm install
npm run build
```

See the full developer guide: [docs/DEVELOPMENT.md](./docs/DEVELOPMENT.md)

---

## Contributing

Contributions are welcome!

- **Bug reports / feature requests:** [Open an issue](https://github.com/ProgrammerNomad/strapi-plugin-vercel-deploy/issues)
- **Feature suggestions:** [Discussions / Issues](https://github.com/ProgrammerNomad/strapi-plugin-vercel-deploy/issues)
- **Pull requests:** Fork the repo, make your changes, and open a PR against `main`

---

## Links

- **npm:** [npmjs.com/package/@nomadprogrammer/strapi-plugin-vercel-deploy](https://www.npmjs.com/package/@nomadprogrammer/strapi-plugin-vercel-deploy)
- **GitHub:** [github.com/ProgrammerNomad/strapi-plugin-vercel-deploy](https://github.com/ProgrammerNomad/strapi-plugin-vercel-deploy)
- **Issues:** [github.com/ProgrammerNomad/strapi-plugin-vercel-deploy/issues](https://github.com/ProgrammerNomad/strapi-plugin-vercel-deploy/issues)
- **Author:** [github.com/ProgrammerNomad](https://github.com/ProgrammerNomad/)

---

## License

MIT © [ProgrammerNomad](https://github.com/ProgrammerNomad/)
