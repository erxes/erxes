import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';
import { z } from 'zod';
import { useFacebookBotAiAgents } from '~/widgets/automations/modules/facebook/components/bots/hooks/useFacebookBotAiAgents';
import {
  buildAiReplySeedLink,
  TAiReplyChannel,
} from '~/widgets/automations/modules/facebook/components/bots/utils/buildAiReplySeedLink';
import { useFacebookCommentTriggerClaims } from '~/widgets/automations/modules/facebook/components/trigger/hooks/useFacebookCommentTriggerClaims';
import { useFacebookBotTriggerClaims } from '~/widgets/automations/modules/facebook/components/trigger/hooks/useFacebookBotTriggerClaims';

const aiReplyFormSchema = z.object({
  aiAgentId: z.string().min(1, 'Choose an AI agent'),
});

export type TAiReplyForm = z.infer<typeof aiReplyFormSchema>;

/**
 * Picks the agent for an AI reply flow and opens it in the builder. Another
 * active automation answering any text on the same bot would reply twice, so
 * it blocks; a draft one is only shown.
 */
export const useFacebookBotAiReplyForm = ({
  channel,
  botId,
  botName,
  open,
}: {
  channel: TAiReplyChannel | null;
  botId: string;
  botName?: string;
  open: boolean;
}) => {
  const navigate = useNavigate();
  const form = useForm<TAiReplyForm>({
    resolver: zodResolver(aiReplyFormSchema),
    defaultValues: { aiAgentId: '' },
  });

  const {
    agents,
    loading: agentsLoading,
    error,
  } = useFacebookBotAiAgents(!open);
  const { claims: messageClaims, loading: messageClaimsLoading } =
    useFacebookBotTriggerClaims(open ? botId : undefined);
  const { claims: commentClaims, loading: commentClaimsLoading } =
    useFacebookCommentTriggerClaims(open ? botId : undefined);

  const conflicts =
    channel === 'comment'
      ? commentClaims.anyPost
      : messageClaims.directCatchAll;
  const activeConflicts = conflicts.filter(({ isActive }) => isActive);
  const draftConflicts = conflicts.filter(({ isActive }) => !isActive);
  const claimsLoading =
    channel === 'comment' ? commentClaimsLoading : messageClaimsLoading;

  const onSubmit = form.handleSubmit(({ aiAgentId }) => {
    if (!channel || activeConflicts.length) {
      return;
    }

    navigate(buildAiReplySeedLink({ channel, botId, botName, aiAgentId }));
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
