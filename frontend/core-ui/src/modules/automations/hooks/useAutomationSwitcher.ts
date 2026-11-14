import { useAutomationSearchList } from '@/automations/hooks/useAutomationSearchList';
import { useState } from 'react';
import { useNavigate } from 'react-router';

export const useAutomationSwitcher = (currentId?: string) => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const searchList = useAutomationSearchList(open);

  const handleSelect = (automationId: string) => {
    setOpen(false);
    if (automationId !== currentId) {
      navigate(`/automations/edit/${automationId}`);
    }
  };

  return {
    open,
    setOpen,
    ...searchList,
    handleSelect,
  };
};
