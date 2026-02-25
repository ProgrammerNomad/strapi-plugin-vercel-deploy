import React, { useEffect, useState } from "react";
import { useIntl } from "react-intl";
import { Layouts, Page, useFetchClient } from "@strapi/strapi/admin";
import {
  Box,
  Flex,
  Loader,
  Field,
  TextInput,
  Link,
  EmptyStateLayout,
} from "@strapi/design-system";
import { PLUGIN_ID } from "../pluginId";

interface PluginConfig {
  deployHook?: string;
  apiToken?: string;
  appFilter?: string;
  teamFilter?: string;
}

export const SettingsPage = () => {
  const { formatMessage } = useIntl();
  const { get } = useFetchClient();

  const [isLoading, setIsLoading] = useState(true);
  const [config, setConfig] = useState<PluginConfig>({});
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    get(`/${PLUGIN_ID}/config`)
      .then((response: any) => {
        setConfig(response.data?.data ?? response.data ?? {});
      })
      .catch((err: any) => {
        console.error("[vercel-deploy] error fetching config", err);
        setHasError(true);
      })
      .finally(() => setIsLoading(false));
  }, [get]);

  if (isLoading) {
    return (
      <Flex justifyContent="center" padding={8}>
        <Loader>
          {formatMessage({
            id: `${PLUGIN_ID}.settings-page.loader`,
            defaultMessage: "Loading settings...",
          })}
        </Loader>
      </Flex>
    );
  }

  if (hasError) {
    return (
      <Box padding={8}>
        <EmptyStateLayout
          icon={<span />}
          content="There was an error fetching the plugin configuration."
        />
      </Box>
    );
  }

  return (
    <Page.Main>
      <Layouts.Header
        title={formatMessage({
          id: `${PLUGIN_ID}.settings-page.header.title`,
          defaultMessage: "Configuration",
        })}
        subtitle={formatMessage({
          id: `${PLUGIN_ID}.settings-page.header.subtitle`,
          defaultMessage: "Configure your Vercel Deploy plugin",
        })}
      />
      <Layouts.Content>
        <Box
          background="neutral0"
          shadow="tableShadow"
          paddingTop={6}
          paddingBottom={6}
          paddingLeft={7}
          paddingRight={7}
          hasRadius
        >
          <Flex direction="column" gap={6}>
            <Field.Root required name="deploy-hook" hint={
              <>
                Learn more about{" "}
                <Link href="https://vercel.com/docs/git/deploy-hooks" isExternal>
                  Vercel Deploy Hooks
                </Link>
              </>
            }>
              <Field.Label>
                {formatMessage({
                  id: `${PLUGIN_ID}.settings-page.deploy-hook.label`,
                  defaultMessage: "Deploy Hook",
                })}
              </Field.Label>
              <TextInput
                placeholder={formatMessage({
                  id: `${PLUGIN_ID}.settings-page.deploy-hook.placeholder`,
                  defaultMessage: "You need to set `deployHook` in plugin config",
                })}
                value={config.deployHook ?? ""}
                disabled
              />
              <Field.Hint />
            </Field.Root>

            <Field.Root required name="api-token" hint={
              <>
                Access tokens can be created and managed inside your{" "}
                <Link href="https://vercel.com/account/tokens" isExternal>
                  account settings
                </Link>
              </>
            }>
              <Field.Label>
                {formatMessage({
                  id: `${PLUGIN_ID}.settings-page.api-token.label`,
                  defaultMessage: "API token",
                })}
              </Field.Label>
              <TextInput
                placeholder={formatMessage({
                  id: `${PLUGIN_ID}.settings-page.api-token.placeholder`,
                  defaultMessage: "You need to set `apiToken` in plugin config",
                })}
                value={config.apiToken ?? ""}
                disabled
              />
              <Field.Hint />
            </Field.Root>

            <Field.Root name="app-name" hint={
              <>
                Set the name of your{" "}
                <Link href="https://vercel.com/dashboard" isExternal>
                  Vercel App
                </Link>{" "}
                to see only the deployments you need
              </>
            }>
              <Field.Label>
                {formatMessage({
                  id: `${PLUGIN_ID}.settings-page.app-name.label`,
                  defaultMessage: "App Name",
                })}
              </Field.Label>
              <TextInput
                placeholder={formatMessage({
                  id: `${PLUGIN_ID}.settings-page.app-name.placeholder`,
                  defaultMessage: "You need to set `appFilter` in plugin config",
                })}
                value={config.appFilter ?? ""}
                disabled
              />
              <Field.Hint />
            </Field.Root>

            <Field.Root name="team-id" hint={
              <>
                Set the id of your{" "}
                <Link href="https://vercel.com/dashboard" isExternal>
                  Vercel Team
                </Link>{" "}
                to see only the deployments you need
              </>
            }>
              <Field.Label>
                {formatMessage({
                  id: `${PLUGIN_ID}.settings-page.team-id.label`,
                  defaultMessage: "Team Id",
                })}
              </Field.Label>
              <TextInput
                placeholder={formatMessage({
                  id: `${PLUGIN_ID}.settings-page.team-id.placeholder`,
                  defaultMessage: "You need to set `teamFilter` in plugin config",
                })}
                value={config.teamFilter ?? ""}
                disabled
              />
              <Field.Hint />
            </Field.Root>
          </Flex>
        </Box>
      </Layouts.Content>
    </Page.Main>
  );
};

export default SettingsPage;

