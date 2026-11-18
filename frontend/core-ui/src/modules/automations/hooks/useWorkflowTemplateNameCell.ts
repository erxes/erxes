import { TWorkflowTemplate } from '@/automations/hooks/useWorkflowTemplateList';
import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';

/** A template's name cell: opening the template, and renaming it on Enter. */
export const useWorkflowTemplateNameCell = (
  template: TWorkflowTemplate,
  onRename: (template: TWorkflowTemplate, name: string) => void,
) => {
  const navigate = useNavigate();
  const currentName = template.name;
  const [editingName, setEditingName] = useState(currentName);

  const rename = useCallback(() => {
    if (editingName === currentName || !editingName.trim()) {
      return;
    }

    onRename(template, editingName);
  }, [editingName, currentName, onRename, template]);

  const openTemplate = useCallback(
    () => navigate(`/automations/templates/${template._id}`),
    [navigate, template._id],
  );

  return { currentName, editingName, setEditingName, rename, openTemplate };
};
