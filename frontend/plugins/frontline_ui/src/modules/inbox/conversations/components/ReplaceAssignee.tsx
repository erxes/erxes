import { SelectMember } from 'ui-modules';
import { toast } from 'erxes-ui';
import { useAtomValue } from 'jotai';
import { useEffect, useRef, useState } from 'react';
import { selectConversationsState } from '@/inbox/conversations/states/selectConversationsState';
import { useAssignConversations } from '@/inbox/conversations/hooks/useAssignConversations';
import { useTranslation } from 'react-i18next';

export const ReplaceAssignee = () => {
  const { t } = useTranslation('frontline');
  const conversationIds = useAtomValue(selectConversationsState);
  const selectionKey = conversationIds.join(',');
  const { assignConversations, loading } = useAssignConversations();
  const [ids, setIds] = useState<string[]>([]);
  const busy = useRef(false);
  const activeSelection = useRef(selectionKey);
  activeSelection.current = selectionKey;
  useEffect(() => setIds([]), [selectionKey]);
  const assign = async (value: string | string[] | null) => {
    if (busy.current || !conversationIds.length) return;
    const nextIds = Array.isArray(value)
      ? value
      : [value].filter((id): id is string => typeof id === 'string');
    busy.current = true;
    const previous = ids;
    setIds(nextIds);
    try {
      await assignConversations({
        variables: { conversationIds, assignedUserIds: nextIds },
      });
      toast({ title: t('assignees-updated', 'Assignees updated') });
    } catch (error) {
      if (activeSelection.current === selectionKey) setIds(previous);
      toast({
        title: t('error', 'Error'),
        description:
          error instanceof Error
            ? error.message
            : t('assignment-failed', 'Could not update assignees'),
        variant: 'destructive',
      });
    } finally {
      busy.current = false;
    }
  };
  return (
    <SelectMember
      mode="multiple"
      value={ids}
      disabled={loading}
      allowUnassigned
      onValueChange={(value) => {
        void assign(value);
      }}
      placeholder={t('select-assignee', 'Select assignees')}
    />
  );
};
