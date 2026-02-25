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
} from "@strapi/design-system";
import { Plus, ExternalLink, Eye, ArrowLeft, WarningCircle, Information } from "@strapi/icons";
import { PLUGIN_ID } from "../pluginId";
import { useDeployAvailability } from "../hooks/useDeployAvailability";
import { useDeployments } from "../hooks/useDeployments";

const getStateColor = (state: string) => {
  switch (state) {
    case "READY": return "success700";
    case "ERROR":
    case "CANCELED": return "danger700";
    default: return "warning700";
  }
};

const getStateBgColor = (state: string) => {
  switch (state) {
    case "READY": return "success100";
    case "ERROR":
    case "CANCELED": return "danger100";
    default: return "warning100";
  }
};

const InfoBox = ({ icon, message }: { icon: React.ReactNode; message: string }) => (
  <Flex
    direction="column"
    alignItems="center"
    justifyContent="center"
    gap={4}
    padding={10}
  >
    <Box color="neutral500" style={{ fontSize: "48px" }}>{icon}</Box>
    <Typography variant="beta" textColor="neutral500" textAlign="center">
      {message}
    </Typography>
  </Flex>
);

export const HomePage = () => {
  const { formatMessage } = useIntl();
  const { get } = useFetchClient();
  const { toggleNotification } = useNotification();

  const [isDeploying, setIsDeploying] = useState(false);
  const [usePolling, setUsePolling] = useState(false);

  const [isLoadingAvailability, availability, availabilityError] = useDeployAvailability();

  const canDeploy = availability?.runDeploy === "AVAILABLE";
  const canList = availability?.listDeploy === "AVAILABLE";

  // Stable callback — must not be recreated each render to avoid infinite fetch loop
  const onDeploymentsFetched = React.useCallback((hasNonFinalState: boolean) => {
    setUsePolling(hasNonFinalState);
  }, []);

  const [isLoadingDeployments, deployments, deploymentsError] = useDeployments(
    usePolling,
    onDeploymentsFetched,
    canList && !isLoadingAvailability
  );

  const runDeploy = async () => {
    try {
      setIsDeploying(true);
      await get(`/${PLUGIN_ID}/deploy/run`);
      setUsePolling(true);
      toggleNotification({
        type: "success",
        message: "Deployment triggered successfully",
      });
    } catch (err) {
      console.error("[vercel-deploy] deploy error", err);
      toggleNotification({
        type: "danger",
        message: "Deployment failed — please retry",
      });
    } finally {
      setIsDeploying(false);
    }
  };

  const renderContent = () => {
    // Still loading availability
    if (isLoadingAvailability) {
      return (
        <Flex justifyContent="center" padding={10}>
          <Loader>Loading...</Loader>
        </Flex>
      );
    }

    // Availability API error (403 or generic)
    if (availabilityError) {
      return (
        <InfoBox
          icon={<WarningCircle />}
          message={
            availabilityError === "FORBIDDEN"
              ? "You do not have permission to access this plugin."
              : "Could not check feature availability — please reload the page."
          }
        />
      );
    }

    // Missing API token — cannot list deployments
    if (!canList) {
      return (
        <InfoBox
          icon={<Information />}
          message="You need to set the Vercel API Token. Go to Plugin Settings → Configuration for more info."
        />
      );
    }

    // Loading deployments (first load)
    if (isLoadingDeployments && deployments.length === 0) {
      return (
        <Flex justifyContent="center" padding={10}>
          <Loader>
            {formatMessage({
              id: `${PLUGIN_ID}.home-page.deployments.loader`,
              defaultMessage: "Fetching deployments...",
            })}
          </Loader>
        </Flex>
      );
    }

    // Deployments fetch error
    if (deploymentsError) {
      return (
        <InfoBox
          icon={<WarningCircle />}
          message="There was an error fetching deployments from Vercel. Check your API Token and try again."
        />
      );
    }

    // No deployments
    if (deployments.length === 0) {
      return (
        <InfoBox
          icon={<Information />}
          message="No deployments found in your Vercel account."
        />
      );
    }

    // Deployments table
    return (
      <Table colCount={4} rowCount={deployments.length + 1}>
        <Thead>
          <Tr>
            <Th>
              <Typography variant="sigma">
                {formatMessage({ id: `${PLUGIN_ID}.deployments-list.table-header.app-name`, defaultMessage: "App Name" })}
              </Typography>
            </Th>
            <Th>
              <Flex gap={2} alignItems="center">
                <Typography variant="sigma">
                  {formatMessage({ id: `${PLUGIN_ID}.deployments-list.table-header.state`, defaultMessage: "State" })}
                </Typography>
                {usePolling && <Loader small>Updating...</Loader>}
              </Flex>
            </Th>
            <Th>
              <Typography variant="sigma">
                {formatMessage({ id: `${PLUGIN_ID}.deployments-list.table-header.creation-date`, defaultMessage: "Creation Date" })}
              </Typography>
            </Th>
            <Th><Typography variant="sigma"> </Typography></Th>
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
                  {entry.url && (
                    <Tooltip label="Visit deployment">
                      <Link href={`https://${entry.url}`} isExternal aria-label="Visit">
                        <ExternalLink />
                      </Link>
                    </Tooltip>
                  )}
                  {entry.inspectorUrl && (
                    <Tooltip label="Inspect deployment">
                      <Link href={entry.inspectorUrl} isExternal aria-label="Inspect">
                        <Eye />
                      </Link>
                    </Tooltip>
                  )}
                </Flex>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    );
  };

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
            disabled={!canDeploy || isDeploying || isLoadingAvailability}
            loading={isDeploying}
          >
            {formatMessage({ id: `${PLUGIN_ID}.deploy-button.label`, defaultMessage: "Deploy" })}
          </Button>
        }
        title={formatMessage({ id: `${PLUGIN_ID}.home-page.header.title`, defaultMessage: "Vercel Deploy" })}
        subtitle={formatMessage({
          id: `${PLUGIN_ID}.home-page.header.subtitle`,
          defaultMessage: "Manual deploy - Start a deployment on Vercel using the webhook you configured",
        })}
      />
      <Layouts.Content>
        <Box background="neutral0" hasRadius shadow="tableShadow">
          {renderContent()}
        </Box>
      </Layouts.Content>
    </Page.Main>
  );
};

export default HomePage;

