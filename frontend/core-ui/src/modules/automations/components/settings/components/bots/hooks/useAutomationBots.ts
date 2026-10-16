import {
  AUTOMATION_BOTS_TOTAL_COUNT,
  AUTOMATIONS_BOTS_CONSTANTS,
} from '@/automations/components/settings/components/bots/graphql/automationsBotsQueries';
import { IAutomationBotsConstantsQueryResponse } from '@/automations/components/settings/components/bots/types/automationBots';
import { useQuery } from '@apollo/client';
import { useTranslation } from 'react-i18next';

export const useAutomationBots = () => {
  const { data, loading, error } =
    useQuery<IAutomationBotsConstantsQueryResponse>(AUTOMATIONS_BOTS_CONSTANTS);

  const { automationBotsConstants = [] } = data || {};

  return {
    automationBotsConstants,
    isEmpty: !automationBotsConstants?.length && !loading,
    loading,
    error,
  };
};

export const useAutomationBotTotalCount = (queryName: string, skip?: any) => {
  const { data, loading } = useQuery<Record<string, number>>(
    AUTOMATION_BOTS_TOTAL_COUNT(queryName),
    {
      skip: skip,
    },
  );

  const totalCount = data?.[queryName] ?? 0;

  return {
    totalCount,
    loading: !queryName ? false : loading,
  };
};

export const useAutomationBotIntegrationDetail = (botType: string) => {
  const { t } = useTranslation('automations');
  const {
    automationBotsConstants,
    loading: botConstantsLoading,
    error: botConstantsError,
  } = useAutomationBots();

  const botIntegrationConstant = automationBotsConstants.find(
    ({ name }) => name === botType,
  );

  // Always call the hook with a safe fallback

  // Handle error after all hooks are safely called
  if (!botIntegrationConstant || botConstantsError) {
    return {
      error: botConstantsError?.message || t('settings-bots-not-found'),
      botIntegrationConstant: null,
      totalCount: 0,
      loading: botConstantsLoading,
    };
  }

  return {
    botIntegrationConstant,
    loading: botConstantsLoading,
    error: null,
  };
};
