import type { Core } from '@strapi/strapi';

export default ({ strapi }: { strapi: Core.Strapi }) => ({
  async runDeploy(ctx) {
    try {
      const result = await strapi
        .plugin('vercel-deploy')
        .service('deploy')
        .runDeploy();

      if (result.error) {
        ctx.badRequest(result.error);
      } else {
        ctx.body = result;
      }
    } catch (error) {
      ctx.throw(500, error);
    }
  },

  async getDeployments(ctx) {
    try {
      const result = await strapi
        .plugin('vercel-deploy')
        .service('deploy')
        .getDeployments();

      if (result.error) {
        ctx.badRequest(result.error);
      } else {
        ctx.body = result;
      }
    } catch (error) {
      ctx.throw(500, error);
    }
  },

  async deployAvailability(ctx) {
    const result = await strapi
      .plugin('vercel-deploy')
      .service('deploy')
      .deployAvailability();
      
    ctx.body = result;
  },
});
