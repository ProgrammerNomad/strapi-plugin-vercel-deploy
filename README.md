# strapi-plugin-vercel-deploy

Strapi v5 plugin to trigger and monitor deployments on Vercel.

## Development Workflow

This plugin uses [yalc](https://github.com/wclr/yalc) for local development (the official Strapi recommended approach).

### Setup (first time)

```bash
# Install yalc globally
npm install -g yalc
```

### After making changes to the plugin

```bash
# In plugin dir (C:\xampp\htdocs\strapi-plugin-vercel-deploy):
npm run build
yalc push

# In Strapi dir (C:\xampp\htdocs\mobrilz-strapi):
npm run build  # only needed when admin/UI files changed
# restart Strapi
```

### Initial installation into a Strapi project

```bash
# In plugin dir — build and publish to local yalc store:
npm run build
yalc publish

# In Strapi project dir — add the plugin:
yalc add @nomadprogrammer/strapi-plugin-vercel-deploy
npm install --legacy-peer-deps
npm run build
npm run dev
```

### Plugin configuration (`config/plugins.js`)

```js
'vercel-deploy': {
  enabled: true,
  config: {
    deployHook: env('VERCEL_DEPLOY_PLUGIN_HOOK'),
    apiToken: env('VERCEL_DEPLOY_PLUGIN_API_TOKEN'),
    appFilter: env('VERCEL_DEPLOY_PLUGIN_APP_FILTER'),
    teamFilter: env('VERCEL_DEPLOY_PLUGIN_TEAM_FILTER'),
    roles: env.array('VERCEL_DEPLOY_PLUGIN_ROLES', []),
  },
},
```
