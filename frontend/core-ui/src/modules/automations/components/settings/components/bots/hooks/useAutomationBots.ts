import {
  AUTOMATION_BOTS_TOTAL_COUNT,
  AUTOMATIONS_BOTS_CONSTANTS,
} from '@/automations/components/settings/components/bots/graphql/automationsBotsQueries';
import { IAutomationBotsConstantsQueryResponse } from '@/automations/components/settings/components/bots/types/automationBots';
import { useQuery } from '@apollo/client';

export const useAutomationBots = () => {
  const { data, loading, error } =
    useQuery<IAutomationBotsConstantsQueryResponse>(AUTOMATIONS_BOTS_CONSTANTS);

  const { automationBotsConstants = [] } = data || {};

  return {
    automationBotsConstants,
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

  const totalCount = (data || {})[queryName] ?? 0;

  return {
    totalCount,
    loading: !queryName ? false : loading,
  };
};

export const useAutomationBotIntegrationDetail = (botType: string) => {
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
      error: botConstantsError?.message || 'Not found bot constants ',
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
