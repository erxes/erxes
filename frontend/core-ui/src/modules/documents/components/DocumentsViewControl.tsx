import {
  IconAdjustmentsHorizontal,
  IconLayoutGrid,
  IconList,
} from '@tabler/icons-react';
import { Button, Popover, PopoverScoped, ToggleGroup } from 'erxes-ui';
import { useAtom } from 'jotai';
import { useState } from 'react';

import { DocumentsView, documentsViewAtom } from '../states/documentsViewState';
import { useTranslation } from 'react-i18next';

function DocumentsViewOptions({
  onValueChange,
  value,
}: {
  onValueChange: (value: string) => void;
  value: DocumentsView;
}) {
  const { t } = useTranslation('documents', { keyPrefix: 'document' });

  return (
    <ToggleGroup
      type="single"
      className="grid grid-cols-2 gap-2"
      value={value}
      onValueChange={onValueChange}
    >
      <ToggleGroup.Item value="list" asChild>
        <Button
          variant="secondary"
          size="lg"
          className="h-11 flex-col gap-0 border"
        >
          <IconList className="size-5!" />
          <span className="text-xs font-normal">{t('list')}</span>
        </Button>
      </ToggleGroup.Item>
      <ToggleGroup.Item value="grid" asChild>
        <Button
          variant="secondary"
          size="lg"
          className="h-11 flex-col gap-0 border"
        >
          <IconLayoutGrid className="size-5!" />
          <span className="text-xs font-normal">{t('grid')}</span>
        </Button>
      </ToggleGroup.Item>
    </ToggleGroup>
  );
}

export function DocumentsViewControl() {
  const { t } = useTranslation('documents', { keyPrefix: 'document' });
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useAtom(documentsViewAtom);

  function handleValueChange(value: string) {
    if (value !== 'list' && value !== 'grid') {
      return;
    }

    setView(value);
    setIsOpen(false);
  }

  return (
    <PopoverScoped open={isOpen} onOpenChange={setIsOpen}>
      <Popover.Trigger asChild>
        <Button variant="ghost">
          <IconAdjustmentsHorizontal />
          {t('display')}
        </Button>
      </Popover.Trigger>
      <Popover.Content>
        <DocumentsViewOptions value={view} onValueChange={handleValueChange} />
      </Popover.Content>
    </PopoverScoped>
  );
}
