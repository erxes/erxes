import { IconSearch } from '@tabler/icons-react';
import { Button, Command, Spinner, usePageHotkey } from 'erxes-ui';
import { Suspense, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { lazyNamed } from '~/lib/lazyNamed';
import { CoreTabTooltip } from '~/modules/navigation/CoreTabTooltip';
import type { SearchBodyProps } from './SearchResults';

const SearchResults = lazyNamed(() => import('./SearchResults'), 'SearchResults');

/**
 * The top bar's search: favorites, apps, people, companies, products, team members,
 * units and every plugin's records in one box. Opens with its button or Ctrl/⌘ K.
 */
export const GlobalSearch = ({
  apps,
  appLabel,
  onOpenApp,
}: Omit<SearchBodyProps, 'text' | 'onDone'>) => {
  const { t } = useTranslation('common', { keyPrefix: 'search' });
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const label = t('title', 'Search');

  usePageHotkey('mod+k', () => setOpen(true));

  const close = () => {
    setOpen(false);
    setText('');
  };

  return (
    <>
      <CoreTabTooltip label={`${label} (Ctrl/⌘ K)`}>
        <Button
          type="button"
          size="icon"
          variant="nav"
          aria-label={label}
          aria-keyshortcuts="Control+K Meta+K"
          className="relative shrink-0"
          onClick={() => setOpen(true)}
        >
          <IconSearch className="size-4" />
        </Button>
      </CoreTabTooltip>
      <Command.Dialog
        open={open}
        onOpenChange={(next) => (next ? setOpen(true) : close())}
        title={label}
        description={t('description', 'Search records and apps')}
        shouldFilter={false}
        className="max-w-2xl"
      >
        <Command.Input
          value={text}
          onValueChange={setText}
          placeholder={t('placeholder', 'Search people, companies, products and more')}
        />
        <Suspense fallback={<Spinner size="sm" className="my-3" />}>
          <SearchResults
            text={text}
            apps={apps}
            appLabel={appLabel}
            onOpenApp={onOpenApp}
            onDone={close}
          />
        </Suspense>
      </Command.Dialog>
    </>
  );
};
