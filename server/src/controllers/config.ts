import type { Core } from '@strapi/strapi';

const buildConfig = (strapi: Core.Strapi, hideSensitiveInfo = false) => {
  const pluginConfig = strapi.plugin('vercel-deploy').config;

  const deployHook = pluginConfig('deployHook');
  const apiToken = pluginConfig('apiToken');
  const appFilter = pluginConfig('appFilter');
  const teamFilter = pluginConfig('teamFilter');
  const roles = pluginConfig('roles') || [];

  return {
    deployHook,
    apiToken: hideSensitiveInfo && apiToken ? `${apiToken.substring(0, 6)}...` : apiToken,
    appFilter,
    teamFilter,
    roles,
  };
};

export default ({ strapi }: { strapi: Core.Strapi }) => ({
  getConfig(ctx) {
    ctx.body = {
      data: buildConfig(strapi, true),
    };
  },
});
