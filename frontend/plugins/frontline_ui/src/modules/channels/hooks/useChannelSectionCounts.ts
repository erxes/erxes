import { TChannelSectionSegment } from '@/channels/constants/channelSections';
import { useGetChannelMembers } from '@/channels/hooks/useGetChannelMembers';
import { isActiveChannelMember } from '@/channels/utils/channelMembers';
import { useFormsTotalCount } from '@/forms/hooks/useFormsTotalCount';
import { useGetPipelines } from '@/pipelines/hooks/useGetPipelines';
import { useGetResponses } from '@/responseTemplate/hooks/useGetResponses';
import { useSurveyTotalCount } from '@/survey/hooks/useSurveyTotalCount';

export type TChannelSectionCounts = Record<
  TChannelSectionSegment,
  number | undefined
>;

export const useChannelSectionCounts = (
  channelId: string,
): TChannelSectionCounts => {
  const { members } = useGetChannelMembers({ channelIds: channelId });
  const { totalCount: pipelines } = useGetPipelines({
    variables: { filter: { channelId, limit: 1 } },
  });
  const { total: forms } = useFormsTotalCount({ variables: { channelId } });
  const { totalCount: surveys } = useSurveyTotalCount({
    variables: { channelId },
  });
  const { totalCount: responses } = useGetResponses({
    variables: { filter: { channelId, limit: 1 } },
  });

  return {
    general: undefined,
    members: members?.filter(isActiveChannelMember).length,
    pipelines: pipelines ?? undefined,
    forms,
    surveys,
    response: responses ?? undefined,
  };
};
