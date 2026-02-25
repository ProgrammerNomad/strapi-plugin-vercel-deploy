import type { Core } from '@strapi/strapi';

const sendError = (ctx: any, result: { error: string; statusCode?: number }) => {
  const code = result.statusCode;
  if (code === 401 || code === 403) {
    ctx.unauthorized(result.error);
  } else if (code === 404) {
    ctx.notFound(result.error);
  } else {
    ctx.badRequest(result.error);
  }
};

export default ({ strapi }: { strapi: Core.Strapi }) => ({
  async runDeploy(ctx) {
    try {
      const result = await strapi
        .plugin('vercel-deploy')
        .service('deploy')
        .runDeploy();

      if (result.error) {
        sendError(ctx, result);
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
        sendError(ctx, result);
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
