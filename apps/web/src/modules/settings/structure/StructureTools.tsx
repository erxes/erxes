import type { UnitKind } from '@erxes/core-contract';
import {
  IconBuilding,
  IconFoldDown,
  IconFoldUp,
  IconPlus,
  IconSearch,
  IconUsersGroup,
} from '@tabler/icons-react';
import { Button, Empty, InputGroup, Skeleton } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

/** Search, and a button that folds or unfolds every unit; null `onFold` when nothing folds. */
export const TreeTools = ({
  search,
  onSearch,
  placeholder,
  folded,
  onFold,
}: {
  search: string;
  onSearch: (search: string) => void;
  placeholder: string;
  folded: boolean;
  onFold: ((fold: boolean) => void) | null;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });

  return (
    <div className="flex items-center gap-2">
      <InputGroup className="w-64">
        <InputGroup.Addon>
          <IconSearch className="size-4" />
        </InputGroup.Addon>
        <InputGroup.Input
          value={search}
          onChange={(event) => onSearch(event.target.value)}
          placeholder={placeholder}
          aria-label={placeholder}
        />
      </InputGroup>
      {onFold && (
        <Button
          variant="outline"
          size="icon"
          disabled={Boolean(search.trim())}
          aria-label={folded ? t('expand-all', 'Expand all') : t('collapse-all', 'Collapse all')}
          title={folded ? t('expand-all', 'Expand all') : t('collapse-all', 'Collapse all')}
          onClick={() => onFold(!folded)}
        >
          {folded ? <IconFoldDown /> : <IconFoldUp />}
        </Button>
      )}
    </div>
  );
};

/** Rows standing in for the tree while it loads. */
export const TreeSkeleton = () => (
  <div className="flex flex-col gap-2 rounded-lg border p-3">
    {Array.from({ length: 5 }, (_, index) => (
      <Skeleton key={index} className="h-8 w-full" />
    ))}
  </div>
);

/** No branches or departments yet: what they are, and a button to add the first. */
export const EmptyKind = ({
  kind,
  title,
  hint,
  add,
  onAdd,
}: {
  kind: UnitKind;
  title: string;
  hint: string;
  /** The button's label; null for members who can't add. */
  add: string | null;
  onAdd: () => void;
}) => {
  const Icon = kind === 'branch' ? IconBuilding : IconUsersGroup;

  return (
    <Empty variant="outline">
      <Empty.Header>
        <Empty.Media variant="icon">
          <Icon />
        </Empty.Media>
        <Empty.Title>{title}</Empty.Title>
        <Empty.Description>{hint}</Empty.Description>
      </Empty.Header>
      {add && (
        <Empty.Content>
          <Button onClick={onAdd}>
            <IconPlus />
            {add}
          </Button>
        </Empty.Content>
      )}
    </Empty>
  );
};

/** A search that found nothing. */
export const NoMatch = ({ search }: { search: string }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });

  return (
    <Empty variant="outline" size="sm">
      <Empty.Description>
        {t('no-match', 'Nothing matches “{{search}}”', { search: search.trim() })}
      </Empty.Description>
    </Empty>
  );
};
