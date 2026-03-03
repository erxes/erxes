import React, { useMemo } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { Spinner } from 'erxes-ui';

import type {
  MNConfigQueryResponse,
  MNConfigsCreateMutationResponse,
  MNConfigsUpdateMutationResponse,
  MNConfigsRemoveMutationResponse,
} from '../types';

import { MN_CONFIG, MN_CONFIGS, STAGES_QUERY } from '../graphql/clientQueries';
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
  multiple?: boolean;
};

const SettingsContainer = ({
  component: Component,
  configCode,
  subId,
  multiple = false,
}: Props) => {
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
   * and include the raw subId for stage selection in the form.
   */
  const normalizedConfigs = useMemo(() => {
    if (multiple) {
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
          subId: raw.subId,          // include subId for stage selection
          ...normalized,
        };
      });
    } else {
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
          subId: raw.subId,          // include subId for stage selection
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
   * Accepts an optional formSubId that overrides any stageId inside config.
   */

  const save = async (config: Record<string, any>, formSubId?: string) => {
    const { _id, ...rest } = config;
    const value = denormalizeConfig(rest);

    // Priority: formSubId > rest.stageId > prop subId
    const finalSubId = formSubId ?? rest.stageId ?? subId ?? '';

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

  return (
    <Component
      configs={normalizedConfigs}
      save={save}
      delete={remove}
    />
  );
};

export default SettingsContainer;
