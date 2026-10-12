import { useEffect } from 'react';
import { REACT_APP_API_URL } from 'erxes-ui';

const POLL_INTERVAL_MS = 5000;

// /initial-setup needs core-api and Mongo; the gateway's /health would pass with core-api down.
export const useBackendRecovery = () => {
  useEffect(() => {
    let checking = false;

    const check = () => {
      if (checking) return;
      checking = true;

      fetch(`${REACT_APP_API_URL}/initial-setup`, {
        signal: AbortSignal.timeout(POLL_INTERVAL_MS - 500),
      })
        .then((res) => {
          if (res.ok) window.location.reload();
        })
        .catch(() => undefined)
        .finally(() => {
          checking = false;
        });
    };

    const interval = window.setInterval(check, POLL_INTERVAL_MS);

    return () => window.clearInterval(interval);
  }, []);
};
