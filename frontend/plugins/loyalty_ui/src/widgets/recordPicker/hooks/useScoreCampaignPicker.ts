import { useQueryState } from 'erxes-ui';
import { useEffect, useState } from 'react';

/**
 * Creating or editing a campaign without leaving the host's form. The edit
 * sheet answers to `editScoreId`, so only the picker that asked mounts it.
 */
export const useScoreCampaignPicker = (
  value: string | undefined,
  onValueChange: (value: string) => void,
) => {
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editScoreId, setEditScoreId] = useQueryState<string>('editScoreId');

  useEffect(() => {
    if (editing && !editScoreId) {
      setEditing(false);
    }
  }, [editing, editScoreId]);

  return {
    creating,
    setCreating,
    editing,
    startEdit: () => {
      if (!value) {
        return;
      }

      setEditing(true);
      setEditScoreId(value);
    },
    created: (campaignId: string) => {
      onValueChange(campaignId);
      setCreating(false);
    },
  };
};
