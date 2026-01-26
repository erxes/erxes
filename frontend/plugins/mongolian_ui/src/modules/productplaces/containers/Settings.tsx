import React, { useEffect, useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { Spinner } from 'erxes-ui';

import type {
  MNConfigQueryResponse,
  MNConfigsCreateMutationResponse,
  MNConfigsUpdateMutationResponse,
  MNConfigsRemoveMutationResponse
} from '../types';

import { MN_CONFIG } from '../graphql/clientQueries';

import {
  MN_CONFIGS_CREATE,
  MN_CONFIGS_UPDATE,
  MN_CONFIGS_REMOVE
} from '../graphql/clientMutations';

import {
  normalizeConfig,
  denormalizeConfig,
  normalizePlaceConfig,
  normalizeSplitConfig,
  normalizePrintConfig
} from '../configUtils';

type Props = {
  component: React.ComponentType<any>;
  configCode: string;
  subId?: string;
};

const SettingsContainer = ({ component: Component, configCode, subId }: Props) => {
  const { data, loading, error, refetch } = useQuery<MNConfigQueryResponse>(
    MN_CONFIG,
    {
      variables: {
        code: configCode,
        subId: subId ?? null
      },
      fetchPolicy: 'network-only',
      errorPolicy: 'all'
    }
  );

  const [mnConfigsCreate] =
    useMutation<MNConfigsCreateMutationResponse>(MN_CONFIGS_CREATE);

  const [mnConfigsUpdate] =
    useMutation<MNConfigsUpdateMutationResponse>(MN_CONFIGS_UPDATE);

  const [mnConfigsRemove] =
    useMutation<MNConfigsRemoveMutationResponse>(MN_CONFIGS_REMOVE);

  const [normalizedConfig, setNormalizedConfig] = useState<Record<string, any>>(
    {}
  );

  const mnConfig = data?.mnConfig ?? null;

  // reset when switching configCode/subId
  useEffect(() => {
    setNormalizedConfig({});
  }, [configCode, subId]);

  // normalize based on configCode
  useEffect(() => {
    if (!mnConfig || !mnConfig.value) {
      setNormalizedConfig({});
      return;
    }

    try {
      let normalized: Record<string, any> = {};

      if (configCode === 'dealsProductsDataPlaces') {
        normalized = normalizePlaceConfig(mnConfig);
      } else if (configCode === 'dealsProductsDataSplit') {
        normalized = normalizeSplitConfig(mnConfig);
      } else if (configCode === 'dealsProductsDataPrint') {
        normalized = normalizePrintConfig(mnConfig);
      } else {
        normalized = normalizeConfig(mnConfig);
      }

      // if you want _id in components:
      setNormalizedConfig({ _id: mnConfig._id, ...normalized });
    } catch (err) {
      console.error(`[SettingsContainer:${configCode}] normalize failed`, err);
      setNormalizedConfig({});
    }
  }, [mnConfig, configCode]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner />
      </div>
    );
  }

  if (!data) {
    console.warn(`[SettingsContainer:${configCode}] Apollo returned undefined data`);
    return null;
  }

  if (error && !mnConfig) {
    const msg = error.message?.toLowerCase?.() || '';

    // If config doesn't exist yet, show empty UI instead of error
    if (msg.includes('config not found')) {
      // let the component render with empty config
    } else {
      return (
        <div className="p-4 bg-red-50 text-red-700 rounded">
          Error loading configuration: {error.message}
        </div>
      );
    }
  }

  const save = async (config: Record<string, any>) => {
    // remove meta fields before saving
    const { _id, ...rest } = config;

    const value = denormalizeConfig(rest);

    if (mnConfig?._id) {
      await mnConfigsUpdate({
        variables: {
          _id: mnConfig._id,
          subId: subId ?? null,
          value
        }
      });
    } else {
      await mnConfigsCreate({
        variables: {
          code: configCode,
          subId: subId ?? null,
          value
        }
      });
    }

    await refetch();
    return true;
  };

  const remove = async () => {
    if (!mnConfig?._id) return;

    await mnConfigsRemove({
      variables: { _id: mnConfig._id }
    });

    setNormalizedConfig({});
    await refetch();
  };

  return (
    <Component
      config={normalizedConfig}
      save={save}
      delete={remove}
      loading={loading}
    />
  );
};

export default SettingsContainer;
