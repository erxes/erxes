import { gql, useQuery } from '@apollo/client';

const AUTOMATION_CONSTANTS = gql`
  query AutomationConstants {
    automationConstants
  }
`;

type ICondition = {
  type: string;
  label: string;
  icon: string;
  description: string;
};

export const useFacebookMessengerTrigger = () => {
  const { data, loading } = useQuery(AUTOMATION_CONSTANTS, {
    fetchPolicy: 'cache-first',
  });

  const { triggersConst = [] } = data?.automationConstants || {};

  const facebookMessageConst = triggersConst.find(
    ({ type }: any) => 'frontline:facebook.messages' === type,
  );

  const { conditions = [] } = facebookMessageConst || {};

  return {
    triggerConditionsConstants: conditions as ICondition[],
    loading,
  };
};
