import { useLazyQuery } from '@apollo/client';
import { IconSearch, IconX } from '@tabler/icons-react';
import { Button, Input, Spinner, toast } from 'erxes-ui';
import { KeyboardEvent, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useUsers } from 'ui-modules';
import { useDebounce } from 'use-debounce';
import { IStructureAccessMember } from '@/structure-access';
import { STRUCTURE_ACCESS_MEMBERS } from '@/structure-access/graphql/structureAccessQueries';
import { useStructureWorkspace } from '../../contexts/StructureWorkspaceContext';
import { STRUCTURE_DROP_BLOCKER_PROPS } from '../../hooks/useStructureDnd';
import { useStructureFeedback } from '../../hooks/useStructureFeedback';
import { IStructureDragPerson } from '../../utils/structureDrop';
import { searchStructurePlaces } from '../../utils/structureTree';
import { StructurePersonChip } from '../dnd/StructurePersonChip';
import { StructureEntityTypeIcon } from '../StructureEntityTypeIcon';

const PLACE_LIMIT = 6;
const PEOPLE_LIMIT = 8;
const PEOPLE_MIN_QUERY = 2;

const StructureSearchSection = ({ label }: { label: string }) => (
  <span className="px-2 pb-1 pt-2 text-xs font-medium text-muted-foreground">
    {label}
  </span>
);

const StructureSearchPeople = ({
  query,
  onLocate,
}: {
  query: string;
  onLocate: (person: IStructureDragPerson) => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });
  const { canManage } = useStructureWorkspace();
  const { users, loading, error } = useUsers({
    variables: { searchValue: query },
  });
  const people = users.slice(0, PEOPLE_LIMIT).map(
    (user): IStructureDragPerson => ({
      userId: user._id,
      name: user.details?.fullName || user.email || user._id,
      avatar: user.details?.avatar,
    }),
  );

  if (loading && !people.length) {
    return <Spinner size="sm" containerClassName="py-2" />;
  }

  if (error) {
    return (
      <p className="px-2 py-1 text-xs text-destructive">{error.message}</p>
    );
  }

  if (!people.length) {
    return (
      <p className="px-2 py-1 text-xs text-muted-foreground">
        {t('no-people-found')}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-1 px-1">
      <div className="flex flex-wrap gap-1">
        {people.map((person) => (
          <StructurePersonChip
            key={person.userId}
            dragId={`person:search:${person.userId}`}
            person={person}
            disabled={!canManage}
            className="border bg-background"
            onClick={() => onLocate(person)}
          />
        ))}
      </div>
      {canManage && (
        <span className="px-1 text-xs text-muted-foreground">
          {t('people-drag-hint')}
        </span>
      )}
    </div>
  );
};

export const StructureSearch = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });
  const { entities, typesById, select } = useStructureWorkspace();
  const { failure } = useStructureFeedback();
  const [query, setQuery] = useState('');
  const [debouncedQuery] = useDebounce(query.trim(), 300);
  const [loadMemberships] = useLazyQuery<{
    structureEntityMembers: IStructureAccessMember[];
  }>(STRUCTURE_ACCESS_MEMBERS, { fetchPolicy: 'network-only' });
  const places = useMemo(
    () => searchStructurePlaces(entities, query, PLACE_LIMIT),
    [entities, query],
  );
  const open = query.trim().length > 0;

  const pick = (entityId: string) => {
    select(entityId, { focus: true });
    setQuery('');
  };

  const locate = async ({ userId, name }: IStructureDragPerson) => {
    const { data, error } = await loadMemberships({
      variables: { userId, includeEnded: false },
    });

    if (error) {
      failure(error);
      return;
    }

    const memberships = data?.structureEntityMembers ?? [];
    const place =
      memberships.find(({ isPrimary }) => isPrimary) ?? memberships[0];

    if (place) {
      pick(place.entityId);
      return;
    }

    toast({ title: t('person-has-no-place', { name }) });
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && places[0]) {
      event.preventDefault();
      pick(places[0]._id);
    }

    if (event.key === 'Escape' && query) {
      event.preventDefault();
      setQuery('');
    }
  };

  return (
    <div {...STRUCTURE_DROP_BLOCKER_PROPS} className="flex w-80 flex-col gap-1">
      <div className="relative">
        <IconSearch className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          placeholder={t('search-placeholder')}
          aria-label={t('search-placeholder')}
          className="pl-8 pr-8 shadow-sm"
          onChange={(event) => setQuery(event.currentTarget.value)}
          onKeyDown={handleKeyDown}
        />
        {open && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-0.5 top-1/2 size-6 -translate-y-1/2"
            aria-label={t('clear-search')}
            onClick={() => setQuery('')}
          >
            <IconX />
          </Button>
        )}
      </div>
      {open && (
        <div className="flex max-h-[60vh] flex-col overflow-y-auto rounded-lg border bg-background p-1 shadow-lg">
          <StructureSearchSection label={t('places')} />
          {places.length ? (
            places.map((place) => (
              <Button
                key={place._id}
                variant="ghost"
                className="h-8 justify-start gap-2 px-2 font-normal"
                onClick={() => pick(place._id)}
              >
                <StructureEntityTypeIcon
                  icon={typesById.get(place.typeId)?.icon}
                  className="size-4 shrink-0 text-muted-foreground"
                />
                <span className="truncate">{place.title}</span>
                {place.code && (
                  <span className="ml-auto shrink-0 font-mono text-xs text-muted-foreground">
                    {place.code}
                  </span>
                )}
              </Button>
            ))
          ) : (
            <p className="px-2 py-1 text-xs text-muted-foreground">
              {t('no-places-found')}
            </p>
          )}
          <StructureSearchSection label={t('people')} />
          {debouncedQuery.length < PEOPLE_MIN_QUERY ? (
            <p className="px-2 py-1 text-xs text-muted-foreground">
              {t('people-search-hint')}
            </p>
          ) : (
            <StructureSearchPeople query={debouncedQuery} onLocate={locate} />
          )}
        </div>
      )}
    </div>
  );
};
