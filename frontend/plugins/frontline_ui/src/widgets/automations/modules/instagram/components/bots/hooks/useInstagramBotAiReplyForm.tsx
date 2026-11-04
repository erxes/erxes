import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';
import { z } from 'zod';
import { useFacebookBotAiAgents } from '~/widgets/automations/modules/facebook/components/bots/hooks/useFacebookBotAiAgents';
import { useInstagramBotAiReplyClaims } from '~/widgets/automations/modules/instagram/components/bots/hooks/useInstagramBotAiReplyClaims';
import {
  buildInstagramAiReplySeedLink,
  TInstagramAiReplyChannel,
} from '~/widgets/automations/modules/instagram/components/bots/utils/buildAiReplySeedLink';

const aiReplyFormSchema = z.object({
  aiAgentId: z.string().min(1, 'Choose an AI agent'),
});

export type TInstagramAiReplyForm = z.infer<typeof aiReplyFormSchema>;

export const useInstagramBotAiReplyForm = ({
  channel,
  botId,
  botName,
  open,
}: {
  channel: TInstagramAiReplyChannel | null;
  botId: string;
  botName?: string;
  open: boolean;
}) => {
  const navigate = useNavigate();
  const form = useForm<TInstagramAiReplyForm>({
    resolver: zodResolver(aiReplyFormSchema),
    defaultValues: { aiAgentId: '' },
  });

  const {
    agents,
    loading: agentsLoading,
    error,
  } = useFacebookBotAiAgents(!open);
  const { claims, loading: claimsLoading } = useInstagramBotAiReplyClaims(
    open ? botId : undefined,
    channel,
  );

  const activeConflicts = claims.filter(({ isActive }) => isActive);
  const draftConflicts = claims.filter(({ isActive }) => !isActive);

  const onSubmit = form.handleSubmit(({ aiAgentId }) => {
    if (!channel || activeConflicts.length) {
      return;
    }

    navigate(
      buildInstagramAiReplySeedLink({ channel, botId, botName, aiAgentId }),
    );
  });

  return {
    form,
    agents,
    agentsLoading,
    agentsError: error,
    activeConflicts,
    draftConflicts,
    claimsLoading,
    canSubmit: !claimsLoading && !activeConflicts.length,
    onSubmit,
  };
};
