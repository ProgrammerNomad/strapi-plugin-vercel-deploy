import { useState, useEffect, useRef, useCallback } from 'react';
import { useFetchClient } from '@strapi/strapi/admin';
import { PLUGIN_ID } from '../pluginId';

export interface Deployment {
  uid: string;
  name: string;
  state: string;
  url: string;
  inspectorUrl: string;
  created: number;
}

const POLL_INTERVAL = 3000;
const finalStates = ['CANCELED', 'ERROR', 'READY'];

export function useDeployments(
  usePolling: boolean,
  onDeploymentsFetched?: (hasNonFinalState: boolean) => void
): [boolean, Deployment[], boolean] {
  const { get } = useFetchClient();
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchDeployments = useCallback(() => {
    get(`/${PLUGIN_ID}/deploy/list`)
      .then((response: any) => {
        const list: Deployment[] = response.data?.data?.deployments ?? response.data?.deployments ?? [];
        setDeployments(list);
        setHasError(false);
        if (onDeploymentsFetched) {
          const hasNonFinal = list.some((d) => !finalStates.includes(d.state));
          onDeploymentsFetched(hasNonFinal);
        }
      })
      .catch((error: any) => {
        console.error('[vercel-deploy] error fetching deployments', error);
        setHasError(true);
        setDeployments([]);
        if (onDeploymentsFetched) onDeploymentsFetched(false);
      })
      .finally(() => setIsLoading(false));
  }, [get, onDeploymentsFetched]);

  useEffect(() => {
    fetchDeployments();
  }, [fetchDeployments]);

  useEffect(() => {
    if (usePolling) {
      intervalRef.current = setInterval(fetchDeployments, POLL_INTERVAL);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [usePolling, fetchDeployments]);

  return [isLoading, deployments, hasError];
}
