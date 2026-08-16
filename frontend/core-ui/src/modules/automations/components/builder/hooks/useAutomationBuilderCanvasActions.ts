import { useAutomation } from '@/automations/context/AutomationProvider';
import { useDuplicateAutomation } from '@/automations/hooks/useDuplicateAutomation';
import { ApolloError } from '@apollo/client';
import { toast } from 'erxes-ui';
import { useAtomValue } from 'jotai';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { currentUserState } from 'ui-modules';

export const useAutomationBuilderCanvasActions = () => {
  const { detail } = useAutomation();
  const currentUser = useAtomValue(currentUserState);
  const navigate = useNavigate();
  const { duplicateAutomation, loading: duplicating } =
    useDuplicateAutomation();
  const [isDuplicateOpen, setDuplicateOpen] = useState(false);
  const [duplicateName, setDuplicateName] = useState('');

  const automationId = detail?._id;
  const automationCreatedBy = detail?.createdBy;
  const canLock = !!automationId && currentUser?._id === automationCreatedBy;

  const openDuplicate = () => {
    setDuplicateName('');
    setDuplicateOpen(true);
  };

  const onDuplicate = () => {
    if (!automationId) {
      return;
    }

    return duplicateAutomation(automationId, {
      variables: { name: duplicateName.trim() || undefined },
      onError: (error: ApolloError) => {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      },
      onCompleted: ({
        automationsDuplicate,
      }: {
        automationsDuplicate?: { _id: string; name: string };
      }) => {
        if (!automationsDuplicate) {
          return;
        }

        setDuplicateOpen(false);
        toast({
          title: 'Success',
          variant: 'success',
          description: `“${automationsDuplicate.name}” created as a draft`,
        });
        navigate(`/automations/edit/${automationsDuplicate._id}`);
      },
    });
  };

  return {
    automationId,
    automationCreatedBy,
    canLock,
    duplicating,
    duplicateName,
    setDuplicateName,
    isDuplicateOpen,
    setDuplicateOpen,
    openDuplicate,
    onDuplicate,
    suggestedDuplicateName: detail?.name
      ? `${detail.name.replace(
          /\s*\(duplicated(\s+\d+)?\)$/i,
          '',
        )} (duplicated)`
      : '',
  };
};
