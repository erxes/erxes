import { DashboardWidgetPreview } from '@/home/dashboard/components/DashboardWidgetPreview';
import { useDashboard } from '@/home/dashboard/context/DashboardProvider';
import {
  TDashboardCatalogEntry,
  useDashboardCatalog,
} from '@/home/dashboard/hooks/useDashboardCatalog';
import { IconChevronRight, IconSearch } from '@tabler/icons-react';
import { cn, Collapsible, Input } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

const CatalogCard = ({
  entry: { widget, label, description, isPlaced },
}: {
  entry: TDashboardCatalogEntry;
}) => {
  const { t } = useTranslation('common', { keyPrefix: 'home.dashboard' });
  const { addWidget, canAddMore, setDraggingWidget } = useDashboard();
  const disabled = isPlaced || !canAddMore;

  return (
    <button
      type="button"
      draggable={!disabled}
      disabled={disabled}
      title={description}
      onClick={() => addWidget(widget)}
      onDragStart={(event) => {
        // Firefox starts no drag without data
        event.dataTransfer.setData('text/plain', widget.type);
        event.dataTransfer.effectAllowed = 'copy';
        setDraggingWidget(widget);
      }}
      onDragEnd={() => setDraggingWidget(null)}
      className={cn(
        'flex flex-col gap-2 rounded-lg border bg-background p-2 text-left transition-colors',
        disabled
          ? 'cursor-not-allowed opacity-50'
          : 'cursor-grab hover:border-primary/50 hover:bg-accent/40 active:cursor-grabbing',
      )}
    >
      <DashboardWidgetPreview preview={widget.preview} icon={widget.icon} />
      <span className="min-w-0 space-y-0.5">
        <span className="line-clamp-1 text-xs font-medium">{label}</span>
        <span className="line-clamp-2 text-[11px] leading-tight text-muted-foreground">
          {isPlaced ? t('already-placed') : description}
        </span>
      </span>
    </button>
  );
};

/** Widgets to drag onto the page (or click to add at the bottom). */
export const DashboardWidgetCatalog = () => {
  const { t } = useTranslation('common', { keyPrefix: 'home.dashboard' });
  const { search, setSearch, groups } = useDashboardCatalog();

  return (
    <aside className="flex h-full w-80 shrink-0 flex-col border-l bg-background">
      <div className="space-y-3 border-b p-4">
        <div className="space-y-0.5">
          <h2 className="text-sm font-semibold">{t('add-widget')}</h2>
          <p className="text-xs text-muted-foreground">{t('catalog-hint')}</p>
        </div>
        <div className="relative">
          <IconSearch className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t('catalog-search')}
            className="pl-8"
          />
        </div>
      </div>
      <div className="styled-scroll flex-1 space-y-1 overflow-y-auto p-3">
        {groups.length === 0 && (
          <p className="px-2 py-6 text-center text-sm text-muted-foreground">
            {t('catalog-empty')}
          </p>
        )}
        {groups.map(({ group, label, entries }) => (
          <Collapsible key={group} defaultOpen className="group/catalog">
            <Collapsible.Trigger className="flex h-8 w-full items-center gap-1.5 rounded-md px-1.5 text-xs font-semibold text-muted-foreground hover:bg-accent/60">
              <IconChevronRight className="size-3.5 transition-transform group-data-[state=open]/catalog:rotate-90" />
              <span className="flex-1 text-left">{label}</span>
              <span className="tabular-nums">{entries.length}</span>
            </Collapsible.Trigger>
            <Collapsible.Content className="grid grid-cols-2 gap-2 pb-3 pt-1">
              {entries.map((entry) => (
                <CatalogCard key={entry.widget.type} entry={entry} />
              ))}
            </Collapsible.Content>
          </Collapsible>
        ))}
      </div>
    </aside>
  );
};
