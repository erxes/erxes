import { IconCategory, IconDots, IconFocusCentered } from '@tabler/icons-react';
import { useReactFlow } from '@xyflow/react';
import { Button, DropdownMenu } from 'erxes-ui';
import { useAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import {
  STRUCTURE_CANVAS_ANIMATION,
  STRUCTURE_CANVAS_FIT_VIEW_OPTIONS,
} from '../constants/structureCanvas';
import { useStructureTypeDialogs } from '../hooks/useStructureTypeDialogs';
import { useStructureView } from '../hooks/useStructureView';
import { structureShowArchivedState } from '../states/structureViewState';

export const StructurePageMenu = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });
  const [showArchived, setShowArchived] = useAtom(structureShowArchivedState);
  const { openNodeTypes } = useStructureTypeDialogs();
  const { view } = useStructureView();
  const { fitView } = useReactFlow();

  return (
    <DropdownMenu>
      <DropdownMenu.Trigger asChild>
        <Button variant="ghost" size="icon" aria-label={t('more-actions')}>
          <IconDots />
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content align="end" className="min-w-48">
        <DropdownMenu.CheckboxItem
          checked={showArchived}
          onCheckedChange={(checked) => setShowArchived(checked === true)}
        >
          {t('show-archived')}
        </DropdownMenu.CheckboxItem>
        <DropdownMenu.Separator />
        <DropdownMenu.Item onSelect={openNodeTypes}>
          <IconCategory />
          {t('node-types')}
        </DropdownMenu.Item>
        {view === 'canvas' && (
          <DropdownMenu.Item
            onSelect={() =>
              fitView({
                ...STRUCTURE_CANVAS_FIT_VIEW_OPTIONS,
                ...STRUCTURE_CANVAS_ANIMATION,
              })
            }
          >
            <IconFocusCentered />
            {t('fit-view')}
          </DropdownMenu.Item>
        )}
      </DropdownMenu.Content>
    </DropdownMenu>
  );
};
