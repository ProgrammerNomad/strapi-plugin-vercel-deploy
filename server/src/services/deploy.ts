import type { Core } from '@strapi/strapi';
import axios from 'axios';

interface VercelDeployConfig {
  deployHook: string;
  apiToken: string;
  appFilter: string;
  teamFilter: string;
  roles: string[];
}

const buildConfig = (strapi: Core.Strapi): VercelDeployConfig => {
  const config = strapi.config.get('plugin::vercel-deploy') as VercelDeployConfig;
  return {
    deployHook: config.deployHook,
    apiToken: config.apiToken,
    appFilter: config.appFilter,
    teamFilter: config.teamFilter,
    roles: config.roles,
  };
};

export default ({ strapi }: { strapi: Core.Strapi }) => ({
  async runDeploy() {
    try {
      const config = buildConfig(strapi);
      if (!config.deployHook) {
        return { error: 'missing configuration: deployHook' };
      }

      const response = await axios.post(config.deployHook);
      const deployJobId = response?.data?.job?.id;

      if (!deployJobId) {
        return { error: `Deployment Id not received. Response: ${JSON.stringify(response.data)}` };
      }

      return {
        data: {
          deployJobId,
        },
      };
    } catch (error: any) {
      const status = error?.response?.status;
      const msg = error?.response?.data?.error?.message ?? error?.message ?? 'Unknown error';
      console.error(`[vercel-deploy] Error while deploying (HTTP ${status}) -`, msg);
      return {
        error: `Deploy failed: ${msg}`,
        statusCode: status,
      };
    }
  },

  async getDeployments() {
    try {
      const config = buildConfig(strapi);
      if (!config.apiToken) {
        return { error: 'missing configuration: apiToken' };
      }

      const params: any = {};
      if (config.appFilter) params.app = config.appFilter;
      if (config.teamFilter) params.teamId = config.teamFilter;

      const response = await axios.get('https://api.vercel.com/v6/deployments', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${config.apiToken}`,
        },
        params,
      });

      return response.data;
    } catch (error: any) {
      const status = error?.response?.status;
      const msg = error?.response?.data?.error?.message ?? error?.message ?? 'Unknown error';
      console.error(`[vercel-deploy] Error fetching deployments (HTTP ${status}) -`, msg);
      return {
        error: `Failed to fetch deployments: ${msg}`,
        statusCode: status,
      };
    }
  },

  deployAvailability() {
    const config = buildConfig(strapi);
    return {
      runDeploy: config.deployHook ? 'AVAILABLE' : 'MISSING_CONFIGURATION_VARIABLE',
      listDeploy: config.apiToken ? 'AVAILABLE' : 'MISSING_CONFIGURATION_VARIABLE',
    };
  },
});
