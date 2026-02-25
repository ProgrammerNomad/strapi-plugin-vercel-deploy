import React, { useState } from "react";
import { useIntl } from "react-intl";
import {
  Layouts,
  Page,
  useFetchClient,
  useNotification,
} from "@strapi/strapi/admin";
import {
  Button,
  Badge,
  Box,
  Flex,
  Table,
  Thead,
  Tbody,
  Tr,
  Td,
  Th,
  Typography,
  Tooltip,
  Link,
  Loader,
  EmptyStateLayout,
} from "@strapi/design-system";
import { Plus, ExternalLink, Eye, ArrowLeft } from "@strapi/icons";
import { PLUGIN_ID } from "../pluginId";
import { useDeployAvailability } from "../hooks/useDeployAvailability";
import { useDeployments } from "../hooks/useDeployments";

const getStateColor = (state: string) => {
  switch (state) {
    case "READY":
      return "success700";
    case "ERROR":
    case "CANCELED":
      return "danger700";
    default:
      return "warning700";
  }
};

const getStateBgColor = (state: string) => {
  switch (state) {
    case "READY":
      return "success100";
    case "ERROR":
    case "CANCELED":
      return "danger100";
    default:
      return "warning100";
  }
};

export const HomePage = () => {
  const { formatMessage } = useIntl();
  const { get } = useFetchClient();
  const { toggleNotification } = useNotification();

  const [isDeploying, setIsDeploying] = useState(false);
  const [usePolling, setUsePolling] = useState(false);

  const [isLoadingAvailability, availability, availabilityError] =
    useDeployAvailability();

  const onDeploymentsFetched = (hasNonFinalState: boolean) => {
    setUsePolling(hasNonFinalState);
  };

  const [isLoadingDeployments, deployments, deploymentsError] = useDeployments(
    usePolling,
    onDeploymentsFetched
  );

  const canDeploy =
    !availabilityError && availability?.runDeploy === "AVAILABLE";
  const canList =
    !availabilityError && availability?.listDeploy === "AVAILABLE";

  const runDeploy = async () => {
    try {
      setIsDeploying(true);
      await get(`/${PLUGIN_ID}/deploy/run`);
      setUsePolling(true);
      toggleNotification({
        type: "success",
        message: formatMessage({
          id: `${PLUGIN_ID}.deploy-button.label`,
          defaultMessage: "Deployment triggered successfully",
        }),
      });
    } catch (err) {
      console.error("[vercel-deploy] deploy error", err);
      toggleNotification({
        type: "danger",
        message: formatMessage({
          id: `${PLUGIN_ID}.deploy-error`,
          defaultMessage: "Deployment failed — please retry",
        }),
      });
    } finally {
      setIsDeploying(false);
    }
  };

  const renderDeployments = () => {
    if (isLoadingDeployments && deployments.length === 0) {
      return (
        <Flex justifyContent="center" padding={8}>
          <Loader>
            {formatMessage({
              id: `${PLUGIN_ID}.home-page.deployments.loader`,
              defaultMessage: "Fetching deployments...",
            })}
          </Loader>
        </Flex>
      );
    }

    if (deploymentsError) {
      return (
        <Box padding={8}>
          <EmptyStateLayout
            icon={<span />}
            content="There was an error fetching deployments. Please retry."
          />
        </Box>
      );
    }

    if (!canList) {
      return (
        <Box padding={8}>
          <EmptyStateLayout
            icon={<span />}
            content="You need to set the API token in plugin config to list deployments."
          />
        </Box>
      );
    }

    if (deployments.length === 0) {
      return (
        <Box padding={8}>
          <EmptyStateLayout
            icon={<span />}
            content="No deployments found."
          />
        </Box>
      );
    }

    return (
      <Table colCount={4} rowCount={deployments.length + 1}>
        <Thead>
          <Tr>
            <Th>
              <Typography variant="sigma">
                {formatMessage({
                  id: `${PLUGIN_ID}.deployments-list.table-header.app-name`,
                  defaultMessage: "App Name",
                })}
              </Typography>
            </Th>
            <Th>
              <Flex gap={2}>
                <Typography variant="sigma">
                  {formatMessage({
                    id: `${PLUGIN_ID}.deployments-list.table-header.state`,
                    defaultMessage: "State",
                  })}
                </Typography>
                {usePolling && <Loader small>Updating...</Loader>}
              </Flex>
            </Th>
            <Th>
              <Typography variant="sigma">
                {formatMessage({
                  id: `${PLUGIN_ID}.deployments-list.table-header.creation-date`,
                  defaultMessage: "Creation Date",
                })}
              </Typography>
            </Th>
            <Th><span /></Th>
          </Tr>
        </Thead>
        <Tbody>
          {deployments.map((entry) => (
            <Tr key={entry.uid}>
              <Td>
                <Typography textColor="neutral800">{entry.name}</Typography>
              </Td>
              <Td>
                <Badge
                  textColor={getStateColor(entry.state)}
                  backgroundColor={getStateBgColor(entry.state)}
                >
                  {entry.state}
                </Badge>
              </Td>
              <Td>
                <Typography textColor="neutral800">
                  {new Date(entry.created).toLocaleString()}
                </Typography>
              </Td>
              <Td>
                <Flex gap={1}>
                  <Tooltip
                    label={formatMessage({
                      id: `${PLUGIN_ID}.deployments-list.table-body.visit-url`,
                      defaultMessage: "Visit",
                    })}
                  >
                    <Link
                      href={`https://${entry.url}`}
                      isExternal
                      aria-label="Visit deployment"
                    >
                      <ExternalLink />
                    </Link>
                  </Tooltip>
                  <Tooltip
                    label={formatMessage({
                      id: `${PLUGIN_ID}.deployments-list.table-body.inspect-url`,
                      defaultMessage: "Inspect",
                    })}
                  >
                    <Link
                      href={entry.inspectorUrl}
                      isExternal
                      aria-label="Inspect deployment"
                    >
                      <Eye />
                    </Link>
                  </Tooltip>
                </Flex>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    );
  };

  if (isLoadingAvailability) {
    return (
      <Page.Loading />
    );
  }

  return (
    <Page.Main>
      <Layouts.Header
        navigationAction={
          <Link href="/admin" startIcon={<ArrowLeft />}>
            Go back
          </Link>
        }
        primaryAction={
          <Button
            startIcon={<Plus />}
            onClick={runDeploy}
            disabled={!canDeploy || isDeploying}
            loading={isDeploying}
          >
            {formatMessage({
              id: `${PLUGIN_ID}.deploy-button.label`,
              defaultMessage: "Deploy",
            })}
          </Button>
        }
        title={formatMessage({
          id: `${PLUGIN_ID}.home-page.header.title`,
          defaultMessage: "Vercel Deploy",
        })}
        subtitle={formatMessage({
          id: `${PLUGIN_ID}.home-page.header.subtitle`,
          defaultMessage:
            "Manual deploy - Start a deployment on Vercel using the webhook you configured",
        })}
      />
      <Layouts.Content>{renderDeployments()}</Layouts.Content>
    </Page.Main>
  );
};

export default HomePage;

