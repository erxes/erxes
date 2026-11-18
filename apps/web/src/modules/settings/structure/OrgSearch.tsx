import type { UnitHit, User } from '@erxes/core-contract';
import { messageOf, orpc } from '@erxes/core-contract/client';
import { IconSearch, IconX } from '@tabler/icons-react';
import { keepPreviousData, skipToken, useQuery, useQueryClient } from '@tanstack/react-query';
import { Avatar, Button, InputGroup, memberName, readImage, Skeleton, useToast } from 'erxes-ui';
import { type KeyboardEvent, type ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDebounce } from 'use-debounce';
import { useWorkspace } from './context';
import { TypeIcon } from './TypeIcon';

const UNIT_LIMIT = 8;
const PEOPLE_LIMIT = 6;
const PEOPLE_MIN_QUERY = 2;

const SectionLabel = ({ children }: { children: ReactNode }) => (
  <p className="px-2 pt-2 pb-1 text-xs font-medium text-muted-foreground first:pt-1">{children}</p>
);

const Hint = ({ children }: { children: ReactNode }) => (
  <p className="px-2 py-1 text-xs text-muted-foreground">{children}</p>
);

const Failed = ({ error }: { error: Error }) => (
  <p role="alert" className="px-2 py-1 text-xs text-destructive-text">
    {messageOf(error)}
  </p>
);

const UnitResults = ({
  hits,
  pending,
  error,
  onPick,
}: {
  hits: UnitHit[];
  pending: boolean;
  error: Error | null;
  onPick: (hit: UnitHit) => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });
  const { typesById } = useWorkspace();

  if (error) return <Failed error={error} />;

  if (pending) return <Skeleton className="mx-2 my-1 h-7" />;

  if (!hits.length) return <Hint>{t('no-units-found', 'No units found')}</Hint>;

  return hits.map((hit) => (
    <Button
      key={hit.id}
      variant="ghost"
      className="h-auto min-h-9 w-full justify-start"
      onClick={() => onPick(hit)}
    >
      <TypeIcon type={hit.typeId ? typesById.get(hit.typeId) : undefined} size="sm" />
      <span className="min-w-0 flex-1 text-left font-normal">
        <span className="block truncate">{hit.name}</span>
        {hit.ancestorNames.length > 0 && (
          <span className="block truncate text-xs text-muted-foreground">
            {hit.ancestorNames.join(' › ')}
          </span>
        )}
      </span>
      {hit.code && (
        <span className="shrink-0 font-mono text-xs text-muted-foreground">{hit.code}</span>
      )}
    </Button>
  ));
};

const PeopleResults = ({ term, onPick }: { term: string; onPick: (person: User) => void }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });

  const people = useQuery({
    ...orpc.users.list.queryOptions({
      input: { search: term, limit: PEOPLE_LIMIT, status: 'active' },
    }),
    placeholderData: keepPreviousData,
  });

  if (people.isError) return <Failed error={people.error} />;

  if (people.isPending) return <Skeleton className="mx-2 my-1 h-7" />;

  if (!people.data.data.length) return <Hint>{t('no-people-found', 'No people found')}</Hint>;

  return people.data.data.map((person) => (
    <Button
      key={person.id}
      variant="ghost"
      className="h-9 w-full justify-start"
      onClick={() => onPick(person)}
    >
      <Avatar size="lg">
        <Avatar.Image src={readImage(person.avatarUrl)} />
        <Avatar.Fallback>{memberName(person).charAt(0)}</Avatar.Fallback>
      </Avatar>
      <span className="truncate font-normal">{memberName(person)}</span>
    </Button>
  ));
};

/** Jumps to the unit a person is in, or says they are in none. */
const usePickPerson = (onPicked: () => void) => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });
  const { select } = useWorkspace();
  const { toast } = useToast();
  const client = useQueryClient();

  return async (person: User) => {
    try {
      const placed = await client.query(
        orpc.units.list.queryOptions({ input: { userId: person.id, limit: 1 } }),
      );

      const [unit] = placed.data;

      if (unit) {
        select(unit.id, unit);
        onPicked();
      } else
        toast({
          title: t('person-in-no-unit', '{{name}} is in no unit yet', {
            name: memberName(person),
          }),
        });
    } catch (error) {
      toast({ variant: 'destructive', title: messageOf(error) });
    }
  };
};

/** Search over units (name or code, with the units above them) and people, who jump to their unit. */
export const OrgSearch = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });
  const { select, includeInactive, canSeeTeam } = useWorkspace();
  const [query, setQuery] = useState('');
  const [debounced] = useDebounce(query.trim(), 250);
  const open = query.trim().length > 0;

  const units = useQuery({
    ...orpc.units.search.queryOptions({
      input: debounced ? { q: debounced, limit: UNIT_LIMIT, includeInactive } : skipToken,
    }),
    placeholderData: keepPreviousData,
  });

  const pick = (hit: UnitHit) => {
    select(hit.id, hit);
    setQuery('');
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    const first = units.data?.data[0];

    if (event.key === 'Enter' && first) {
      event.preventDefault();
      pick(first);
    }

    if (event.key === 'Escape' && query) {
      event.preventDefault();
      event.stopPropagation();
      setQuery('');
    }
  };

  const placeholder = canSeeTeam
    ? t('search-units-people', 'Search units or people')
    : t('search-units', 'Search units');

  return (
    <div className="flex w-72 flex-col gap-1 sm:w-80">
      <InputGroup>
        <InputGroup.Addon>
          <IconSearch className="size-4" />
        </InputGroup.Addon>
        <InputGroup.Input
          value={query}
          placeholder={placeholder}
          aria-label={placeholder}
          onChange={(event) => setQuery(event.currentTarget.value)}
          onKeyDown={onKeyDown}
        />
        {open && (
          <InputGroup.Addon align="end">
            <Button
              variant="ghost"
              size="icon"
              className="size-6"
              aria-label={t('clear-search', 'Clear search')}
              onClick={() => setQuery('')}
            >
              <IconX />
            </Button>
          </InputGroup.Addon>
        )}
      </InputGroup>
      {open && (
        <div className="flex max-h-96 flex-col overflow-y-auto rounded-lg border bg-background p-1 shadow-lg">
          <SectionLabel>{t('units', 'Units')}</SectionLabel>
          <UnitResults
            hits={units.data?.data ?? []}
            pending={units.isPending || !debounced}
            error={units.error}
            onPick={pick}
          />
          {canSeeTeam && <PeopleSection term={debounced} onPicked={() => setQuery('')} />}
        </div>
      )}
    </div>
  );
};

const PeopleSection = ({ term, onPicked }: { term: string; onPicked: () => void }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });
  const pickPerson = usePickPerson(onPicked);

  return (
    <>
      <SectionLabel>{t('people', 'People')}</SectionLabel>
      {term.length < PEOPLE_MIN_QUERY ? (
        <Hint>{t('people-search-hint', 'Type 2 or more letters to find people')}</Hint>
      ) : (
        <PeopleResults term={term} onPick={(person) => void pickPerson(person)} />
      )}
    </>
  );
};
