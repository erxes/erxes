import { Button, Popover } from 'erxes-ui';

import { ChecklistForm } from './ChecklistForm';
import { IconListCheck } from '@tabler/icons-react';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';

export const ChecklistOverview = ({
  label,
  onCreated,
}: Readonly<{
  label?: string;
  onCreated: (checklistId: string) => void;
}>) => {
  const { t } = useTranslation('sales');
  const createdChecklistIdRef = useRef<string>();

  return (
    <Popover>
      <Popover.Trigger asChild>
        <Button variant="outline" size="sm" className="h-7 gap-1.5 px-2">
          <IconListCheck />
          {label ?? t('checklist', 'Checklist')}
        </Button>
      </Popover.Trigger>
      <Popover.Content
        onCloseAutoFocus={(event) => {
          const checklistId = createdChecklistIdRef.current;
          if (!checklistId) return;

          event.preventDefault();
          createdChecklistIdRef.current = undefined;
          onCreated(checklistId);
        }}
      >
        <ChecklistForm
          onCreated={(checklistId) => {
            createdChecklistIdRef.current = checklistId;
          }}
        />
      </Popover.Content>
    </Popover>
  );
};
