import { AutomationCanvasControlButton } from '@/automations/components/builder/controls/AutomationCanvasControlButton';
import { NOTE_DEFAULT_WIDTH } from '@/automations/constants/notes';
import { useAutomation } from '@/automations/context/AutomationProvider';
import { useAutomationNoteActions } from '@/automations/hooks/useAutomationNotes';
import { IconNote } from '@tabler/icons-react';
import { useReactFlow } from '@xyflow/react';
import { useTranslation } from 'react-i18next';

export const AutomationCanvasNoteControl = () => {
  const { t } = useTranslation('automations');
  const { addNote } = useAutomationNoteActions();
  const { isReadOnly } = useAutomation();
  const { screenToFlowPosition } = useReactFlow();

  if (isReadOnly) {
    return null;
  }

  const handleAdd = () => {
    const rect = document.querySelector('.react-flow')?.getBoundingClientRect();

    // Drop it near the middle of what the user is currently looking at.
    addNote(
      screenToFlowPosition({
        x: (rect?.left ?? 0) + (rect?.width ?? 0) / 2 - NOTE_DEFAULT_WIDTH / 2,
        y: (rect?.top ?? 0) + (rect?.height ?? 0) / 3,
      }),
    );
  };

  return (
    <AutomationCanvasControlButton label={t('add-note')} onClick={handleAdd}>
      <IconNote />
    </AutomationCanvasControlButton>
  );
};
