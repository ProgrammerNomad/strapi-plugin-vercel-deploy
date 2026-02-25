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
  onDeploymentsFetched?: (hasNonFinalState: boolean) => void,
  enabled = true
): [boolean, Deployment[], boolean] {
  const { get } = useFetchClient();
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [isLoading, setIsLoading] = useState(enabled);
  const [hasError, setHasError] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasErrorRef = useRef(false);
  // Keep callback in a ref so fetchDeployments never has it as a dep
  const callbackRef = useRef(onDeploymentsFetched);
  useEffect(() => { callbackRef.current = onDeploymentsFetched; });

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // fetchDeployments is stable — only depends on get (from useFetchClient)
  const fetchDeployments = useCallback(() => {
    // Don't fetch if already in error state
    if (hasErrorRef.current) return;

    get(`/${PLUGIN_ID}/deploy/list`)
      .then((response: any) => {
        const list: Deployment[] = response.data?.data?.deployments ?? response.data?.deployments ?? [];
        setDeployments(list);
        setHasError(false);
        hasErrorRef.current = false;
        if (callbackRef.current) {
          const hasNonFinal = list.some((d) => !finalStates.includes(d.state));
          callbackRef.current(hasNonFinal);
        }
      })
      .catch((error: any) => {
        console.error('[vercel-deploy] error fetching deployments', error);
        setHasError(true);
        hasErrorRef.current = true;
        setDeployments([]);
        // Stop polling immediately on error
        stopPolling();
        if (callbackRef.current) callbackRef.current(false);
      })
      .finally(() => setIsLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [get, stopPolling]);

  // Initial fetch — only re-run when enabled changes or fetchDeployments is recreated
  const enabledRef = useRef(enabled);
  useEffect(() => {
    if (enabled && !enabledRef.current) {
      // reset error when re-enabled
      hasErrorRef.current = false;
      setHasError(false);
    }
    enabledRef.current = enabled;
    if (enabled) fetchDeployments();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  useEffect(() => {
    // Don't start polling if already in error state
    if (usePolling && !hasErrorRef.current) {
      intervalRef.current = setInterval(fetchDeployments, POLL_INTERVAL);
    } else {
      stopPolling();
    }
    return () => stopPolling();
  }, [usePolling, fetchDeployments, stopPolling]);

  return [isLoading, deployments, hasError];
}
