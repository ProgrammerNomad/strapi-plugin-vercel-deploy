import { useState, useEffect } from 'react';
import { useFetchClient } from '@strapi/strapi/admin';
import { PLUGIN_ID } from '../pluginId';

export type ApiErrorType = 'FORBIDDEN' | 'GENERIC_ERROR' | undefined;
export type FeatureAvailability = 'AVAILABLE' | 'MISSING_CONFIGURATION_VARIABLE' | undefined;

export interface DeployAvailability {
  runDeploy?: FeatureAvailability;
  listDeploy?: FeatureAvailability;
}

export function useDeployAvailability(): [boolean, DeployAvailability, ApiErrorType] {
  const { get } = useFetchClient();
  const [availability, setAvailability] = useState<DeployAvailability>({});
  const [apiError, setApiError] = useState<ApiErrorType>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    get(`/${PLUGIN_ID}/deploy/availability`)
      .then((response: any) => {
        setAvailability(response.data?.data ?? response.data ?? {});
      })
      .catch((error: any) => {
        console.error('[vercel-deploy] error fetching availability', error);
        setAvailability({});
        if (error?.response?.status === 403) {
          setApiError('FORBIDDEN');
        } else {
          setApiError('GENERIC_ERROR');
        }
      })
      .finally(() => setIsLoading(false));
  }, []);

  return [isLoading, availability, apiError];
}
