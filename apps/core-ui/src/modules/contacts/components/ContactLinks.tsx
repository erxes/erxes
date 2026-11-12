import type { ContactLink } from '@erxes/core-contract';
import { IconDots, IconPlus, IconStarFilled } from '@tabler/icons-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Avatar,
  Badge,
  Button,
  cn,
  Combobox,
  DropdownMenu,
  Input,
  Popover,
  readImage,
  Spinner,
  useToast,
} from 'erxes-ui';
import { useState } from 'react';
import { api, messageOf } from '~/lib/api';
import { useSidePanel } from '~/modules/side-panel/useSidePanel';
import { SelectContactContent } from './ContactPicker';

type Side = 'core:customer' | 'core:company';

interface LinkRow {
  /** The other side's id. */
  id: string;
  name: string;
  avatarUrl: string | null;
  link: ContactLink;
}

const linksKey = (side: Side, id: string) => ['contact-links', side, id];

/** A contact's links to the other kind: a person's companies or a company's people, current first. */
export const useContactLinks = (side: Side, id: string) => {
  const client = useQueryClient();
  const { toast } = useToast();

  const query = useQuery({
    queryKey: linksKey(side, id),
    queryFn: async (): Promise<LinkRow[]> =>
      side === 'core:customer'
        ? (await api.customers.companies({ id })).data.map((company) => ({
            id: company.id,
            name: company.primaryName,
            avatarUrl: company.avatarUrl,
            link: company.link,
          }))
        : (await api.companies.people({ id })).data.map((person) => ({
            id: person.id,
            name:
              [person.firstName, person.lastName].filter(Boolean).join(' ') ||
              person.primaryEmail ||
              person.primaryPhone ||
              'Unnamed',
            avatarUrl: person.avatarUrl,
            link: person.link,
          })),
    enabled: Boolean(id),
  });

  const refresh = () => {
    void client.invalidateQueries({ queryKey: ['contact-links'] });
    void client.invalidateQueries({ queryKey: ['customers'] });
    void client.invalidateQueries({ queryKey: ['companies'] });
  };

  const onError = (error: unknown) =>
    toast({
      variant: 'destructive',
      title: 'Could not update the link',
      description: messageOf(error),
    });

  const pair = (otherId: string) =>
    side === 'core:customer' ? { id, companyId: otherId } : { id: otherId, companyId: id };

  const set = useMutation({
    mutationFn: ({
      otherId,
      ...input
    }: {
      otherId: string;
      role?: string | null;
      isPrimaryContact?: boolean;
      ended?: boolean;
    }) => api.customers.linkCompany({ ...pair(otherId), ...input }),
    onSettled: refresh,
    onError,
  });

  const remove = useMutation({
    mutationFn: (otherId: string) => api.customers.unlinkCompany(pair(otherId)),
    onSettled: refresh,
    onError,
  });

  return { rows: query.data ?? [], loading: query.isPending, error: query.error, set, remove };
};

const RoleEditor = ({
  value,
  onSave,
}: {
  value: string | null;
  onSave: (role: string | null) => void;
}) => {
  const [role, setRole] = useState(value ?? '');

  return (
    <form
      className="flex gap-1 p-1"
      onSubmit={(event) => {
        event.preventDefault();
        onSave(role.trim() || null);
      }}
    >
      <Input
        value={role}
        onChange={(event) => setRole(event.target.value)}
        placeholder="CEO, Buyer, Accountant…"
        className="h-8"
        maxLength={100}
        autoFocus
      />
      <Button type="submit" size="sm">
        Save
      </Button>
    </form>
  );
};

const LinkItem = ({
  side,
  row,
  onChange,
  onUnlink,
}: {
  side: Side;
  row: LinkRow;
  onChange: (input: { role?: string | null; isPrimaryContact?: boolean; ended?: boolean }) => void;
  onUnlink: () => void;
}) => {
  const { openRecord } = useSidePanel();
  const [editing, setEditing] = useState(false);
  const former = Boolean(row.link.endedAt);
  const other = side === 'core:customer' ? 'core:company' : 'core:customer';

  return (
    <div
      className={cn(
        'group flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-muted/60',
        former && 'opacity-60',
      )}
    >
      <Avatar size="lg">
        <Avatar.Image src={readImage(row.avatarUrl ?? undefined)} />
        <Avatar.Fallback>{row.name.charAt(0)}</Avatar.Fallback>
      </Avatar>
      <button
        type="button"
        className="min-w-0 flex-1 text-left"
        onClick={() => openRecord({ contentType: other, contentId: row.id })}
      >
        <span className="flex items-center gap-1.5 truncate text-sm font-medium">
          {row.name}
          {row.link.isPrimaryContact && (
            <IconStarFilled className="size-3 shrink-0 text-warning" aria-label="Main contact" />
          )}
        </span>
        {row.link.role && (
          <span className="block truncate text-xs text-muted-foreground">{row.link.role}</span>
        )}
      </button>
      {former && <Badge variant="secondary">Former</Badge>}
      <Popover open={editing} onOpenChange={setEditing}>
        <DropdownMenu>
          <DropdownMenu.Trigger asChild>
            <Popover.Anchor asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-7 opacity-0 group-hover:opacity-100 data-[state=open]:opacity-100"
                aria-label="Link options"
              >
                <IconDots className="size-4" />
              </Button>
            </Popover.Anchor>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content align="end">
            <DropdownMenu.Item onSelect={() => setEditing(true)}>
              {row.link.role ? 'Change role' : 'Add role'}
            </DropdownMenu.Item>
            <DropdownMenu.Item
              onSelect={() => onChange({ isPrimaryContact: !row.link.isPrimaryContact })}
            >
              {row.link.isPrimaryContact ? 'Not the main contact' : 'Make main contact'}
            </DropdownMenu.Item>
            <DropdownMenu.Item onSelect={() => onChange({ ended: !former })}>
              {former ? 'Works there again' : 'Left the company'}
            </DropdownMenu.Item>
            <DropdownMenu.Separator />
            <DropdownMenu.Item className="text-destructive" onSelect={onUnlink}>
              Unlink
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu>
        <Popover.Content align="end" className="w-72 p-1">
          <RoleEditor
            value={row.link.role}
            onSave={(role) => {
              onChange({ role });
              setEditing(false);
            }}
          />
        </Popover.Content>
      </Popover>
    </div>
  );
};

/**
 * A person's companies, or a company's people: role, main contact, people
 * who left (kept as history, greyed). Same from either side.
 */
export const ContactLinks = ({ side, id }: { side: Side; id: string }) => {
  const { rows, loading, error, set, remove } = useContactLinks(side, id);
  const [adding, setAdding] = useState(false);
  const linked = rows.map((row) => row.id);

  if (loading) return <Spinner containerClassName="h-8 justify-start px-2" size="sm" />;

  if (error) return <p className="px-2 text-xs text-destructive">{messageOf(error)}</p>;

  return (
    <div className="flex flex-col">
      {rows.map((row) => (
        <LinkItem
          key={row.id}
          side={side}
          row={row}
          onChange={(input) => set.mutate({ otherId: row.id, ...input })}
          onUnlink={() => remove.mutate(row.id)}
        />
      ))}
      <Popover open={adding} onOpenChange={setAdding}>
        <Popover.Trigger asChild>
          <Button variant="ghost" size="sm" className="w-fit text-muted-foreground">
            <IconPlus />
            {side === 'core:customer' ? 'Link a company' : 'Add a person'}
          </Button>
        </Popover.Trigger>
        <Combobox.Content>
          <SelectContactContent
            kind={side === 'core:customer' ? 'company' : 'customer'}
            value={linked}
            onValueChange={(ids) => {
              const added = ids.find((otherId) => !linked.includes(otherId));

              if (added) set.mutate({ otherId: added });
              setAdding(false);
            }}
          />
        </Combobox.Content>
      </Popover>
    </div>
  );
};
