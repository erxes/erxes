import { useAutomation } from '@/automations/context/AutomationProvider';
import { useDuplicateAutomation } from '@/automations/hooks/useDuplicateAutomation';
import { ApolloError } from '@apollo/client';
import { toast } from 'erxes-ui';
import { useState } from 'react';
import { useNavigate } from 'react-router';

const stripDuplicateSuffix = (name: string) =>
  name.replace(/\s*\(duplicated(\s+\d+)?\)$/i, '');

export const useAutomationDuplicateAction = () => {
  const { detail } = useAutomation();
  const navigate = useNavigate();
  const { duplicateAutomation, loading: duplicating } =
    useDuplicateAutomation();
  const [isOpen, setOpen] = useState(false);
  const [name, setName] = useState('');

  const automationId = detail?._id;

  const open = () => {
    setName('');
    setOpen(true);
  };

  const onDuplicate = () => {
    if (!automationId) {
      return;
    }

    return duplicateAutomation(automationId, {
      variables: { name: name.trim() || undefined },
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

        setOpen(false);
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
    duplicating,
    isOpen,
    name,
    onDuplicate,
    open,
    setName,
    setOpen,
    suggestedName: detail?.name
      ? `${stripDuplicateSuffix(detail.name)} (duplicated)`
      : '',
  };
};
