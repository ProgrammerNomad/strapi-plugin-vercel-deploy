import { useState, useEffect, useRef } from 'react';
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

  // Keep ALL mutable state in refs to ensure effects have zero deps
  // and never accidentally restart due to new function references.
  const hasErrorRef = useRef(false);
  const isFetchingRef = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // These refs are updated every render (no effect needed)
  const getRef = useRef(get);
  const callbackRef = useRef(onDeploymentsFetched);
  getRef.current = get;
  callbackRef.current = onDeploymentsFetched;

  // Stable fetch function stored in a ref — never changes, always uses latest refs
  const doFetch = useRef(() => {
    if (hasErrorRef.current) return;
    if (isFetchingRef.current) return; // prevent overlapping requests
    isFetchingRef.current = true;

    getRef.current(`/${PLUGIN_ID}/deploy/list`)
      .then((response: any) => {
        const list: Deployment[] =
          response.data?.data?.deployments ?? response.data?.deployments ?? [];
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
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        if (callbackRef.current) callbackRef.current(false);
      })
      .finally(() => {
        setIsLoading(false);
        isFetchingRef.current = false;
      });
  });

  // Initial fetch — only fires when `enabled` changes (true → false resets, false → true fetches)
  const prevEnabledRef = useRef(false);
  useEffect(() => {
    if (enabled && !prevEnabledRef.current) {
      // Transitioning from disabled → enabled: reset error and fetch once
      hasErrorRef.current = false;
      isFetchingRef.current = false;
      setHasError(false);
      doFetch.current();
    }
    prevEnabledRef.current = enabled;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  // Polling — only fires when `usePolling` changes
  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (usePolling && !hasErrorRef.current) {
      intervalRef.current = setInterval(() => doFetch.current(), POLL_INTERVAL);
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usePolling]);

  return [isLoading, deployments, hasError];
}
