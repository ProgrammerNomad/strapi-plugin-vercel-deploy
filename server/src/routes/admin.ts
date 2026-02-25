export default {
  type: 'admin',
  routes: [
    {
      method: 'GET',
      path: '/deploy/run',
      handler: 'deploy.runDeploy',
      config: {
        policies: ['admin::isAuthenticatedAdmin'],
      },
    },
    {
      method: 'GET',
      path: '/deploy/list',
      handler: 'deploy.getDeployments',
      config: {
        policies: ['admin::isAuthenticatedAdmin'],
      },
    },
    {
      method: 'GET',
      path: '/deploy/availability',
      handler: 'deploy.deployAvailability',
      config: {
        policies: ['admin::isAuthenticatedAdmin'],
      },
    },
    {
      method: 'GET',
      path: '/config',
      handler: 'config.getConfig',
      config: {
        policies: ['admin::isAuthenticatedAdmin'],
      },
    },
  ],
};
