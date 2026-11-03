import { IconChevronLeft } from '@tabler/icons-react';
import { Button, ScrollArea } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { IRelationWidgetTab } from 'ui-modules';

const RelationsGroup = ({
  label,
  tabs,
  onSelect,
}: {
  label: string;
  tabs: IRelationWidgetTab[];
  onSelect: (value: string) => void;
}) => {
  if (!tabs.length) {
    return null;
  }

  return (
    <section className="py-1 first:pt-0">
      <h2 className="flex h-7 items-center px-2 font-sans text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </h2>
      <div className="grid grid-cols-2 gap-0.5">
        {tabs.map((tab) => (
          <Button
            key={tab.value}
            type="button"
            variant="ghost"
            className="h-8 min-w-0 justify-start gap-2 px-2 text-sm font-medium"
            onClick={() => onSelect(tab.value)}
          >
            <tab.icon className="size-4 shrink-0" />
            <span className="truncate">{tab.label}</span>
          </Button>
        ))}
      </div>
    </section>
  );
};

/**
 * The record's relation widgets, grouped like the app chooser: plugins, then
 * core modules. Picking one shows its widget, with a way back.
 */
export const SidePanelRelations = ({
  tabs,
}: {
  tabs: IRelationWidgetTab[];
}) => {
  const { t } = useTranslation('common', { keyPrefix: 'navigation' });
  const [selected, setSelected] = useState<string | null>(null);
  const current = tabs.find((tab) => tab.value === selected);

  if (current) {
    return (
      <div className="flex flex-col flex-1 min-h-0 animate-in fade-in-0 duration-150 motion-reduce:animate-none">
        <div className="flex h-9 flex-none items-center gap-1 border-b px-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-7"
            aria-label={t('back', 'Back')}
            onClick={() => setSelected(null)}
          >
            <IconChevronLeft className="size-4" />
          </Button>
          <current.icon className="size-4 text-muted-foreground" />
          <span className="truncate text-sm font-medium">{current.label}</span>
        </div>
        <div className="flex flex-col flex-1 min-h-0">{current.content}</div>
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1 min-h-0" viewportClassName="[&>div]:block!">
      <div className="p-1.5">
        <RelationsGroup
          label={t('plugins', 'Plugins')}
          tabs={tabs.filter((tab) => tab.pluginName !== 'core')}
          onSelect={setSelected}
        />
        <RelationsGroup
          label={t('core-modules', 'Core modules')}
          tabs={tabs.filter((tab) => tab.pluginName === 'core')}
          onSelect={setSelected}
        />
      </div>
    </ScrollArea>
  );
};
