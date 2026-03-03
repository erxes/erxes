import React, { useMemo } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { Spinner } from 'erxes-ui';

import type {
  MNConfigQueryResponse,
  MNConfigsCreateMutationResponse,
  MNConfigsUpdateMutationResponse,
  MNConfigsRemoveMutationResponse,
} from '../types';

import { MN_CONFIG, MN_CONFIGS } from '../graphql/clientQueries'; // add MN_CONFIGS
import {
  MN_CONFIGS_CREATE,
  MN_CONFIGS_UPDATE,
  MN_CONFIGS_REMOVE,
} from '../graphql/clientMutations';

import {
  normalizeConfig,
  denormalizeConfig,
  normalizePlaceConfig,
  normalizeSplitConfig,
  normalizePrintConfig,
} from '../configUtils';

type Props = {
  component: React.ComponentType<any>;
  configCode: string;
  subId?: string;
  multiple?: boolean; // new prop: if true, fetch list
};

const SettingsContainer = ({
  component: Component,
  configCode,
  subId,
  multiple = false, // default to false for backward compatibility
}: Props) => {
  // Determine which query to use
  const { data, loading, error, refetch } = useQuery(
    multiple ? MN_CONFIGS : MN_CONFIG,
    {
      variables: multiple
        ? { code: configCode }
        : { code: configCode, subId: subId ?? '' },
      fetchPolicy: 'network-only',
      errorPolicy: 'all',
    },
  );

  const [createConfig] =
    useMutation<MNConfigsCreateMutationResponse>(MN_CONFIGS_CREATE);
  const [updateConfig] =
    useMutation<MNConfigsUpdateMutationResponse>(MN_CONFIGS_UPDATE);
  const [removeConfig] =
    useMutation<MNConfigsRemoveMutationResponse>(MN_CONFIGS_REMOVE);

  /**
   * Normalize config(s) into the format expected by the component
   */
  const normalizedConfigs = useMemo(() => {
    if (multiple) {
      // We expect an array: data?.mnConfigs
      const rawList = data?.mnConfigs || [];
      return rawList.map((raw: any) => {
        let normalized;
        if (configCode === 'dealsProductsDataPlaces') {
          normalized = normalizePlaceConfig(raw);
        } else if (configCode === 'dealsProductsDataSplit') {
          normalized = normalizeSplitConfig(raw);
        } else if (configCode === 'dealsProductsDataPrint') {
          normalized = normalizePrintConfig(raw);
        } else {
          normalized = normalizeConfig(raw);
        }
        return {
          _id: raw._id,
          ...normalized,
        };
      });
    } else {
      // Single config: data?.mnConfig
      const raw = data?.mnConfig;
      if (!raw?.value) return [];
      let normalized;
      if (configCode === 'dealsProductsDataPlaces') {
        normalized = normalizePlaceConfig(raw);
      } else if (configCode === 'dealsProductsDataSplit') {
        normalized = normalizeSplitConfig(raw);
      } else if (configCode === 'dealsProductsDataPrint') {
        normalized = normalizePrintConfig(raw);
      } else {
        normalized = normalizeConfig(raw);
      }
      return [
        {
          _id: raw._id,
          ...normalized,
        },
      ];
    }
  }, [data, configCode, multiple]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner />
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded">
        Error loading configuration: {error.message}
      </div>
    );
  }

  /**
   * SAVE (create or update)
   */
  const save = async (config: Record<string, any>) => {
    const { _id, ...rest } = config;
    const value = denormalizeConfig(rest);

    // Use the stageId from the form as the subId (if present)
    const finalSubId = rest.stageId || subId || '';

    if (_id) {
      await updateConfig({
        variables: {
          _id,
          subId: finalSubId,
          value,
        },
      });
    } else {
      await createConfig({
        variables: {
          code: configCode,
          subId: finalSubId,
          value,
        },
      });
    }

    await refetch();
    return true;
  };

  /**
   * DELETE by id
   */
  const remove = async (id: string) => {
    if (!id) return;
    await removeConfig({
      variables: { _id: id },
    });
    await refetch();
  };

  // Pass configs as an array, and also the remove function
  return (
    <Component
      configs={normalizedConfigs}
      save={save}
      delete={remove} // add this prop
    />
  );
};

export default SettingsContainer;
