import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { REACT_APP_API_URL, toast } from 'erxes-ui';

import { buildActionGroups } from '../utils/buildActionGroups';
import type { ConsentDetailsResponse, ConsentScope } from '../types';
import { useTranslation } from 'react-i18next';

export const useDeviceAuthorize = () => {
  const { t } = useTranslation('auth');
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(true);
  const [approved, setApproved] = useState(false);
  const [denied, setDenied] = useState(false);
  const [details, setDetails] = useState<ConsentDetailsResponse | null>(null);
  const [selectedScopes, setSelectedScopes] = useState<string[]>([]);

  const userCode = useMemo(
    () => (searchParams.get('user_code') || '').trim(),
    [searchParams],
  );

  const actionGroups = useMemo(
    () => buildActionGroups(details?.scopes || []),
    [details?.scopes],
  );

  useEffect(() => {
    if (!userCode) {
      setLoadingDetails(false);
      return;
    }

    const controller = new AbortController();

    const loadDetails = async () => {
      setLoadingDetails(true);

      try {
        const response = await fetch(
          `${REACT_APP_API_URL}/oauth/device/details?user_code=${encodeURIComponent(userCode)}`,
          { credentials: 'include', signal: controller.signal },
        );

        const result = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(
            result?.error_description || 'Failed to load access request',
          );
        }

        setDetails(result);
        setSelectedScopes(
          (result.scopes || []).map((item: ConsentScope) => item.scope),
        );
      } catch (error) {
        if (controller.signal.aborted) return;

        toast({
          title: t('could-not-load-access-request', 'Could not load access request'),
          description:
            error instanceof Error ? error.message : t('something-went-wrong', 'Something went wrong'),
          variant: 'destructive',
        });
      } finally {
        if (!controller.signal.aborted) {
          setLoadingDetails(false);
        }
      }
    };

    loadDetails();

    return () => controller.abort();
  }, [userCode]);

  const toggleScopes = (scopes: string[], checked: boolean) => {
    setSelectedScopes((current) => {
      const next = new Set(current);

      for (const scope of scopes) {
        if (checked) {
          next.add(scope);
        } else {
          next.delete(scope);
        }
      }

      return [...next];
    });
  };

  const approve = async () => {
    if (!userCode) {
      toast({
        title: t('missing-code', 'Missing code'),
        description: t('device-code-missing', 'Device authorization code is missing.'),
        variant: 'destructive',
      });
      return;
    }

    if (selectedScopes.length === 0) {
      toast({
        title: t('select-at-least-one-permission', 'Select at least one permission'),
        description: t('choose-access-before-authorizing', 'Choose the access you want to grant before authorizing.'),
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${REACT_APP_API_URL}/oauth/device/approve`,
        {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userCode, grantedScopes: selectedScopes }),
        },
      );

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          result?.error_description || 'Failed to approve device',
        );
      }

      if (result?.redirectUrl) {
        window.location.href = result.redirectUrl;
        return;
      }

      setApproved(true);

      toast({
        title: t('access-granted', 'Access granted'),
        description: t('you-can-return-to-app', 'You can return to the application now.'),
        variant: 'success',
      });
    } catch (error) {
      toast({
        title: t('authorization-failed', 'Authorization failed'),
        description:
          error instanceof Error ? error.message : t('something-went-wrong', 'Something went wrong'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const deny = async () => {
    if (!userCode) return;

    setLoading(true);

    try {
      const response = await fetch(`${REACT_APP_API_URL}/oauth/device/deny`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userCode }),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          result?.error_description || 'Failed to cancel request',
        );
      }

      setDenied(true);
    } catch (error) {
      toast({
        title: t('cancel-failed', 'Cancel failed'),
        description:
          error instanceof Error ? error.message : t('something-went-wrong', 'Something went wrong'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    userCode,
    loading,
    loadingDetails,
    approved,
    denied,
    details,
    selectedScopes,
    actionGroups,
    toggleScopes,
    approve,
    deny,
  };
};
