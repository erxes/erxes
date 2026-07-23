import { useNavigationTabs } from '@/navigation/hooks/useNavigationTabs';
import type { NavigationGroupResult } from '@/navigation/hooks/usePluginsNavigationGroups';
import {
  AppHotkeyScope,
  Button,
  Command,
  Kbd,
  Key,
  Separator,
  useScopedHotkeys,
} from 'erxes-ui';
import {
  IconLayoutSidebarLeftCollapse,
  IconPlus,
  IconSearch,
  IconX,
} from '@tabler/icons-react';
import { useState, type DragEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { usePluginDisplayName } from '@/navigation/hooks/usePluginDisplayName';

interface NavigationTabStripProps {
  onOpenPlugin: (pluginId: string) => void;
  onTogglePanel: () => void;
}

interface NavigationTabButtonProps {
  group: NavigationGroupResult;
  index: number;
  isActive: boolean;
  onClose: () => void;
  onDragEnd: () => void;
  onDragOver: () => void;
  onDragStart: () => void;
  onSelect: () => void;
}

const NavigationTabButton = ({
  group,
  index,
  isActive,
  onClose,
  onDragEnd,
  onDragOver,
  onDragStart,
  onSelect,
}: NavigationTabButtonProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'navigation-shell' });
  const pluginName = usePluginDisplayName(group.name, group.i18n);
  const Icon = group.icon;

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    onDragOver();
  };

  return (
    <div
      className="flex h-7 max-w-48 items-center gap-0.5 rounded bg-transparent pr-0.5 hover:bg-accent"
      draggable
      onDragEnd={onDragEnd}
      onDragOver={handleDragOver}
      onDragStart={onDragStart}
    >
      <Button
        aria-current={isActive ? 'page' : undefined}
        className="h-7 min-w-0 flex-1 justify-start px-2 text-xs"
        onClick={onSelect}
        title={pluginName}
        variant={isActive ? 'secondary' : 'ghost'}
      >
        {Icon && <Icon className="size-3.5 shrink-0 text-primary" />}
        <span className="truncate">{pluginName}</span>
        {isActive && (
          <Kbd className="ml-auto hidden xl:inline-flex">⌘{index + 1}</Kbd>
        )}
      </Button>
      <Button
        aria-label={t('close-tab', { name: pluginName })}
        className="size-5 shrink-0 p-0"
        onClick={onClose}
        size="icon"
        title={t('close-tab', { name: pluginName })}
        variant="ghost"
      >
        <IconX className="size-3" />
      </Button>
    </div>
  );
};

interface PluginPaletteItemProps {
  group: NavigationGroupResult;
  onSelect: () => void;
}

const PluginPaletteItem = ({ group, onSelect }: PluginPaletteItemProps) => {
  const pluginName = usePluginDisplayName(group.name, group.i18n);
  const Icon = group.icon;

  return (
    <Command.Item onSelect={onSelect} value={pluginName}>
      {Icon && <Icon />}
      <span>{pluginName}</span>
    </Command.Item>
  );
};

const NavigationPluginPalette = ({
  onOpenPlugin,
  onOpenChange,
  open,
}: Pick<NavigationTabStripProps, 'onOpenPlugin'> & {
  onOpenChange: (open: boolean) => void;
  open: boolean;
}) => {
  const { navigationGroups } = useNavigationTabs();
  const { t } = useTranslation('common', { keyPrefix: 'navigation-shell' });

  const handleSelect = (pluginId: string) => {
    onOpenPlugin(pluginId);
    onOpenChange(false);
  };

  return (
    <Command.Dialog
      dialogContentClassName="max-w-lg"
      onOpenChange={onOpenChange}
      open={open}
    >
      <Command.Input placeholder={t('search-plugins')} />
      <Command.List>
        <Command.Empty>{t('no-plugins-found')}</Command.Empty>
        <Command.Group heading={t('plugins')}>
          {Object.entries(navigationGroups).map(([pluginId, group]) => (
            <PluginPaletteItem
              group={group}
              key={pluginId}
              onSelect={() => handleSelect(pluginId)}
            />
          ))}
        </Command.Group>
      </Command.List>
    </Command.Dialog>
  );
};

export const NavigationTabStrip = ({
  onOpenPlugin,
  onTogglePanel,
}: NavigationTabStripProps) => {
  const { activePlugin, closeTab, reorderTabs, tabs } = useNavigationTabs();
  const [draggedPluginId, setDraggedPluginId] = useState<string | null>(null);
  const [isPluginPaletteOpen, setPluginPaletteOpen] = useState(false);
  const { t } = useTranslation('common', { keyPrefix: 'navigation-shell' });

  useScopedHotkeys(
    `${Key.Meta}+1, ${Key.Meta}+2, ${Key.Meta}+3, ${Key.Meta}+4, ${Key.Meta}+5, ${Key.Meta}+6, ${Key.Meta}+7, ${Key.Meta}+8, ${Key.Meta}+9`,
    (event) => {
      const tabIndex = Number(event.key) - 1;
      const tab = tabs[tabIndex];

      if (tab) {
        onOpenPlugin(tab.id);
      }
    },
    AppHotkeyScope.Sidebar,
    [onOpenPlugin, tabs],
  );

  useScopedHotkeys(
    `${Key.Meta}+k`,
    () => setPluginPaletteOpen(true),
    AppHotkeyScope.CommandMenu,
  );

  return (
    <header className="flex h-10 shrink-0 items-center gap-2 border-b bg-muted/60 px-2">
      <Button
        aria-label={t('toggle-panel')}
        onClick={onTogglePanel}
        size="icon"
        title={t('toggle-panel')}
        variant="ghost"
      >
        <IconLayoutSidebarLeftCollapse />
      </Button>
      <Separator className="h-5" orientation="vertical" />
      <div className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto py-1">
        {tabs.map(({ id, group }, index) => (
          <NavigationTabButton
            group={group}
            index={index}
            isActive={id === activePlugin}
            key={id}
            onClose={() => closeTab(id)}
            onDragEnd={() => setDraggedPluginId(null)}
            onDragOver={() => {
              if (draggedPluginId) {
                reorderTabs(draggedPluginId, id);
              }
            }}
            onDragStart={() => setDraggedPluginId(id)}
            onSelect={() => onOpenPlugin(id)}
          />
        ))}
        <Button
          aria-label={t('open-plugin')}
          className="shrink-0"
          onClick={() => setPluginPaletteOpen(true)}
          size="icon"
          title={t('open-plugin')}
          variant="ghost"
        >
          <IconPlus />
        </Button>
      </div>
      <Button
        aria-label={t('open-plugin')}
        className="h-7 gap-1.5 px-2 text-xs text-accent-foreground"
        onClick={() => setPluginPaletteOpen(true)}
        title={t('open-plugin')}
        variant="ghost"
      >
        <IconSearch className="size-3.5" />
        <span className="hidden sm:inline">{t('search')}</span>
        <Kbd className="hidden md:inline-flex">⌘K</Kbd>
      </Button>
      <NavigationPluginPalette
        onOpenChange={setPluginPaletteOpen}
        onOpenPlugin={onOpenPlugin}
        open={isPluginPaletteOpen}
      />
    </header>
  );
};
