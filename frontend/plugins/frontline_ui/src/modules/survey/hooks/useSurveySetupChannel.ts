import { useAtomValue } from 'jotai';
import { useParams } from 'react-router';
import { surveySetupGeneralAtom } from '@/survey/states/surveySetupStates';

export const useSurveySetupChannel = () => {
  const { id: routeChannelId } = useParams<{ id: string }>();
  const general = useAtomValue(surveySetupGeneralAtom);

  return {
    channelId: routeChannelId || general.channelId || undefined,
    isChannelRoute: Boolean(routeChannelId),
    returnPath: routeChannelId
      ? `/settings/frontline/channels/${routeChannelId}/surveys`
      : '/frontline/surveys',
  };
};
