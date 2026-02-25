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
  Typography,
} from "@strapi/design-system";
import { PLUGIN_ID } from "../pluginId";

interface PluginConfig {
  deployHook?: string;
  apiToken?: string;
  appFilter?: string;
  teamFilter?: string;
}

const FieldRow = ({
  name,
  label,
  required,
  value,
  placeholder,
  hint,
}: {
  name: string;
  label: string;
  required?: boolean;
  value: string;
  placeholder: string;
  hint: React.ReactNode;
}) => (
  <Box
    paddingLeft={10}
    paddingRight={10}
    paddingTop={2}
    paddingBottom={2}
  >
    <Field.Root name={name}>
      <Field.Label>
        {label}
        {required && (
          <Typography textColor="danger600" aria-hidden>
            {" "}*
          </Typography>
        )}
      </Field.Label>
      <TextInput placeholder={placeholder} value={value} disabled />
      <Typography variant="pi" textColor="neutral600">
        {hint}
      </Typography>
    </Field.Root>
  </Box>
);

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
        <Box background="neutral0" hasRadius shadow="tableShadow" paddingTop={6} paddingBottom={6}>
          <FieldRow
            name="deploy-hook"
            label={formatMessage({
              id: `${PLUGIN_ID}.settings-page.deploy-hook.label`,
              defaultMessage: "Deploy Hook",
            })}
            required
            value={config.deployHook ?? ""}
            placeholder={formatMessage({
              id: `${PLUGIN_ID}.settings-page.deploy-hook.placeholder`,
              defaultMessage: "You need to set `deployHook` in plugin config",
            })}
            hint={
              <>
                Learn more about{" "}
                <Link href="https://vercel.com/docs/git/deploy-hooks" isExternal>
                  Vercel Deploy Hooks
                </Link>
              </>
            }
          />
          <FieldRow
            name="api-token"
            label={formatMessage({
              id: `${PLUGIN_ID}.settings-page.api-token.label`,
              defaultMessage: "API token",
            })}
            required
            value={config.apiToken ?? ""}
            placeholder={formatMessage({
              id: `${PLUGIN_ID}.settings-page.api-token.placeholder`,
              defaultMessage: "You need to set `apiToken` in plugin config",
            })}
            hint={
              <>
                Access tokens can be created and managed inside your{" "}
                <Link href="https://vercel.com/account/tokens" isExternal>
                  account settings
                </Link>
              </>
            }
          />
          <FieldRow
            name="app-name"
            label={formatMessage({
              id: `${PLUGIN_ID}.settings-page.app-name.label`,
              defaultMessage: "App Name",
            })}
            value={config.appFilter ?? ""}
            placeholder={formatMessage({
              id: `${PLUGIN_ID}.settings-page.app-name.placeholder`,
              defaultMessage: "You need to set `appFilter` in plugin config",
            })}
            hint={
              <>
                Set the name of your{" "}
                <Link href="https://vercel.com/dashboard" isExternal>
                  Vercel App
                </Link>{" "}
                to see only the deployments you need
              </>
            }
          />
          <FieldRow
            name="team-id"
            label={formatMessage({
              id: `${PLUGIN_ID}.settings-page.team-id.label`,
              defaultMessage: "Team Id",
            })}
            value={config.teamFilter ?? ""}
            placeholder={formatMessage({
              id: `${PLUGIN_ID}.settings-page.team-id.placeholder`,
              defaultMessage: "You need to set `teamFilter` in plugin config",
            })}
            hint={
              <>
                Set the id of your{" "}
                <Link href="https://vercel.com/dashboard" isExternal>
                  Vercel Team
                </Link>{" "}
                to see only the deployments you need
              </>
            }
          />
        </Box>
      </Layouts.Content>
    </Page.Main>
  );
};

export default SettingsPage;

