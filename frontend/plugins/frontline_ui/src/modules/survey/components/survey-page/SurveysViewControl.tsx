import { Button, Popover, PopoverScoped, ToggleGroup } from 'erxes-ui';
import {
  IconAdjustmentsHorizontal,
  IconLayoutGrid,
  IconTable,
} from '@tabler/icons-react';
import { useAtom } from 'jotai';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { surveyViewAtom } from '@/survey/states/surveyViewState';

export const SurveysViewControl = () => {
  const { t } = useTranslation('frontline', { keyPrefix: 'modules.survey' });
  const [view, setView] = useAtom(surveyViewAtom);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <PopoverScoped open={isOpen} onOpenChange={setIsOpen}>
      <Popover.Trigger asChild>
        <Button variant="ghost">
          <IconAdjustmentsHorizontal />
          {t('view')}
        </Button>
      </Popover.Trigger>
      <Popover.Content>
        <ToggleGroup
          type="single"
          className="grid grid-cols-2 gap-2"
          value={view}
          onValueChange={(value) => {
            if (!value) return;
            setView(value as 'list' | 'grid');
            setIsOpen(false);
          }}
        >
          <ToggleGroup.Item value="list" asChild>
            <Button
              variant="secondary"
              size="lg"
              className="h-11 flex-col gap-0"
            >
              <IconTable className="!size-5" />
              <span className="text-xs font-normal">{t('list')}</span>
            </Button>
          </ToggleGroup.Item>
          <ToggleGroup.Item value="grid" asChild>
            <Button
              variant="secondary"
              size="lg"
              className="h-11 flex-col gap-0"
            >
              <IconLayoutGrid className="!size-5" />
              <span className="text-xs font-normal">{t('board')}</span>
            </Button>
          </ToggleGroup.Item>
        </ToggleGroup>
      </Popover.Content>
    </PopoverScoped>
  );
};
