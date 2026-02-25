import { getTranslation } from "./utils/getTranslation";
import { PLUGIN_ID } from "./pluginId";
import { Initializer } from "./components/Initializer";
import { PluginIcon } from "./components/PluginIcon";

export default {
  register(app: any) {
    app.addMenuLink({
      to: `plugins/${PLUGIN_ID}`,
      icon: PluginIcon,
      intlLabel: {
        id: `${PLUGIN_ID}.plugin.name`,
        defaultMessage: 'Vercel Deploy',
      },
      Component: async () => {
        const { App } = await import('./pages/App');
        return App;
      },
    });

    const settingsBaseName = `${PLUGIN_ID}-settings`;
    app.createSettingSection(
      {
        id: settingsBaseName,
        intlLabel: {
          id: `${settingsBaseName}.section-label`,
          defaultMessage: 'Vercel Deploy',
        },
      },
      [
        {
          intlLabel: {
            id: `${settingsBaseName}.configuration-label`,
            defaultMessage: 'Configuration',
          },
          id: `${settingsBaseName}-configuration`,
          to: `/settings/${PLUGIN_ID}`,
          Component: async () => {
            const { SettingsPage } = await import('./pages/SettingsPage');
            return SettingsPage;
          },
        },
      ]
    );

    app.registerPlugin({
      id: PLUGIN_ID,
      initializer: Initializer,
      isReady: false,
      name: 'Vercel Deploy',
    });
  },

  async registerTrads({ locales }: { locales: string[] }) {
    return Promise.all(
      locales.map(async (locale) => {
        try {
          const { default: data } = await import(
            `./translations/${locale}.json`
          );

          return { data, locale };
        } catch {
          return { data: {}, locale };
        }
      })
    );
  },
};