import { z } from 'zod';
import React, { useState } from 'react';
import { useAtomValue } from 'jotai';
import { useTranslation } from 'react-i18next';
import { Button } from 'erxes-ui/components/button';
import { Dialog } from 'erxes-ui/components/dialog';
import { Input } from 'erxes-ui/components/input';
import { useFilterContext } from '../hooks/useFilterContext';
import { useFilterQueryState } from '../hooks/useFilterQueryState';
import { openDialogState } from '../states/filterStates';

export const FilterDialog = (props: React.ComponentPropsWithoutRef<typeof Dialog>) => {
  const { id, setOpenDialog, resetFilterState } = useFilterContext();
  const openDialog = useAtomValue(openDialogState(id));

  return (
    <Dialog
      open={openDialog}
      onOpenChange={(open) => {
        setOpenDialog(open);

        if (!open) resetFilterState();
      }}
      {...props}
    />
  );
};

// Rendered inside <Filter.View inDialog>, so it mounts each time the dialog opens on it.
export const FilterDialogStringView = ({
  filterKey,
  label,
}: {
  filterKey: string;
  label?: string;
}) => {
  const { t } = useTranslation();
  const { setDialogView, setOpenDialog, sessionKey } = useFilterContext();
  const [query, setQuery] = useFilterQueryState(filterKey, z.string(), sessionKey ?? '');
  const [dialogSearch, setDialogSearch] = useState(query ?? '');

  const onSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setQuery(dialogSearch.length > 0 ? dialogSearch : null);
    setDialogView('root');
    setOpenDialog(false);
  };

  const isSearch = !label && filterKey === 'searchValue';

  const displayPlaceholder = isSearch
    ? t('filter.enter-search-text', 'Enter search text')
    : label || filterKey.charAt(0).toUpperCase() + filterKey.slice(1);

  return (
    <Dialog.Content>
      <form onSubmit={onSubmit}>
        <Dialog.Header>
          <Dialog.Title className="font-medium text-lg">
            {isSearch ? t('filter.search', 'Search') : `Filter by ${label || filterKey}...`}
          </Dialog.Title>
        </Dialog.Header>

        <Input
          placeholder={displayPlaceholder}
          aria-label={displayPlaceholder}
          className="my-4"
          value={dialogSearch}
          onChange={(e) => setDialogSearch(e.target.value)}
        />
        <Dialog.Footer className="sm:space-x-3">
          <Dialog.Close render={<Button variant="outline" size="lg" />}>Cancel</Dialog.Close>
          <Button size="lg" type="submit">
            Apply
          </Button>
        </Dialog.Footer>
      </form>
    </Dialog.Content>
  );
};
