import { IconSearch } from '@tabler/icons-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../../../components/button';
import { Popover } from '../../../components/popover';
import { TypedInput } from '../../conditions/TypedInput';
import { useListConditions } from './listFilterQuery';
import { Chip } from './RuleChips';

/** The search box: the list follows as typing pauses; Enter closes it. */
export const SearchBox = ({ onDone }: { onDone: () => void }) => {
  const { t } = useTranslation('views', { keyPrefix: 'filter' });
  const { search, setSearch } = useListConditions();

  return (
    <div className="flex items-center gap-2 p-2">
      <IconSearch className="size-4 shrink-0 text-muted-foreground" />
      <TypedInput
        focusOnMount
        className="h-8"
        aria-label={t('search', 'Search')}
        placeholder={t('search-placeholder', 'Search…')}
        initial={search ?? ''}
        onCommit={(text) => setSearch(text.trim() || null)}
        onEnter={onDone}
      />
    </div>
  );
};

/** The search as a chip: what is searched, which opens the box; remove clears it. */
export const SearchChip = () => {
  const { t } = useTranslation('views', { keyPrefix: 'filter' });
  const { search, setSearch } = useListConditions();
  const [open, setOpen] = useState(false);

  if (!search) return null;

  return (
    <Chip removeLabel={t('remove-search', 'Clear the search')} onRemove={() => setSearch(null)}>
      <Popover open={open} onOpenChange={setOpen}>
        <Popover.Trigger
          render={<Button variant="segment" className="max-w-60 min-w-0 gap-1.5 rounded-l px-2" />}
        >
          <IconSearch className="text-muted-foreground" />
          <span className="text-muted-foreground">{t('search', 'Search')}</span>
          <span className="truncate font-medium">“{search}”</span>
        </Popover.Trigger>
        <Popover.Content variant="flush" align="start" className="w-72">
          <SearchBox onDone={() => setOpen(false)} />
        </Popover.Content>
      </Popover>
    </Chip>
  );
};
