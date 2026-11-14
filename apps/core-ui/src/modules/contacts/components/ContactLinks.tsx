import { IconDots, IconPlus, IconStarFilled } from '@tabler/icons-react';
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
} from 'erxes-ui';
import { useEffect, useRef, useState } from 'react';
import { QueryState } from '~/components/QueryState';
import { useSidePanel } from '~/modules/side-panel/useSidePanel';
import { SelectContactContent } from './ContactPicker';
import { type ContactSide, type LinkRow, useContactLinks } from './useContactLinks';

type LinkChange = { role?: string | null; isPrimaryContact?: boolean; ended?: boolean };

const RoleEditor = ({
  value,
  onSave,
}: {
  value: string | null;
  onSave: (role: string | null) => void;
}) => {
  const [role, setRole] = useState(value ?? '');
  const input = useRef<HTMLInputElement>(null);

  // Opened from the link's menu: typing starts at once.
  useEffect(() => input.current?.focus(), []);

  return (
    <form
      className="flex gap-1 p-1"
      onSubmit={(event) => {
        event.preventDefault();
        onSave(role.trim() || null);
      }}
    >
      <Input
        ref={input}
        value={role}
        onChange={(event) => setRole(event.target.value)}
        placeholder="CEO, Buyer, Accountant…"
        aria-label="Role"
        className="h-8"
        maxLength={100}
      />
      <Button type="submit" size="sm">
        Save
      </Button>
    </form>
  );
};

/** Role, main contact, left the company, unlink. */
const LinkMenu = ({
  row,
  onChange,
  onUnlink,
}: {
  row: LinkRow;
  onChange: (input: LinkChange) => void;
  onUnlink: () => void;
}) => {
  const [editing, setEditing] = useState(false);
  const former = Boolean(row.link.endedAt);
  // The role editor opens under the menu button, which belongs to the menu, not the popover.
  const menuButton = useRef<HTMLButtonElement>(null);

  return (
    <Popover open={editing} onOpenChange={setEditing}>
      <DropdownMenu>
        <DropdownMenu.Trigger
          render={
            <Button
              ref={menuButton}
              variant="ghost"
              size="icon"
              className="size-7 opacity-0 group-hover:opacity-100 data-popup-open:opacity-100"
              aria-label="Link options"
            />
          }
        >
          <IconDots className="size-4" />
        </DropdownMenu.Trigger>
        <DropdownMenu.Content align="end">
          <DropdownMenu.Item onClick={() => setEditing(true)}>
            {row.link.role ? 'Change role' : 'Add role'}
          </DropdownMenu.Item>
          <DropdownMenu.Item
            onClick={() => onChange({ isPrimaryContact: !row.link.isPrimaryContact })}
          >
            {row.link.isPrimaryContact ? 'Not the main contact' : 'Make main contact'}
          </DropdownMenu.Item>
          <DropdownMenu.Item onClick={() => onChange({ ended: !former })}>
            {former ? 'Works there again' : 'Left the company'}
          </DropdownMenu.Item>
          <DropdownMenu.Separator />
          <DropdownMenu.Item className="text-destructive" onClick={onUnlink}>
            Unlink
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu>
      <Popover.Content anchor={menuButton} align="end" className="w-72 p-1">
        <RoleEditor
          value={row.link.role}
          onSave={(role) => {
            onChange({ role });
            setEditing(false);
          }}
        />
      </Popover.Content>
    </Popover>
  );
};

const LinkItem = ({
  side,
  row,
  onChange,
  onUnlink,
}: {
  side: ContactSide;
  row: LinkRow;
  onChange: (input: LinkChange) => void;
  onUnlink: () => void;
}) => {
  const { openRecord } = useSidePanel();
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
      <LinkMenu row={row} onChange={onChange} onUnlink={onUnlink} />
    </div>
  );
};

/** Picks another record to link. */
const AddLink = ({
  side,
  linked,
  onAdd,
}: {
  side: ContactSide;
  linked: string[];
  onAdd: (otherId: string) => void;
}) => {
  const [adding, setAdding] = useState(false);

  return (
    <Popover open={adding} onOpenChange={setAdding}>
      <Popover.Trigger render={<Button variant="ghost" size="sm" tone="muted" className="w-fit" />}>
        <IconPlus />
        {side === 'core:customer' ? 'Link a company' : 'Add a person'}
      </Popover.Trigger>
      <Combobox.Content>
        <SelectContactContent
          kind={side === 'core:customer' ? 'company' : 'customer'}
          value={linked}
          onValueChange={(ids) => {
            const added = ids.find((otherId) => !linked.includes(otherId));

            if (added) onAdd(added);
            setAdding(false);
          }}
        />
      </Combobox.Content>
    </Popover>
  );
};

/**
 * A person's companies, or a company's people: role, main contact, people
 * who left (kept as history, greyed). Same from either side.
 */
export const ContactLinks = ({ side, id }: { side: ContactSide; id: string }) => {
  const { query, set, remove } = useContactLinks(side, id);

  return (
    <QueryState
      query={query}
      className="justify-start p-2"
      loading={<Spinner containerClassName="h-8 justify-start px-2" size="sm" />}
    >
      {(rows) => (
        <div className="flex flex-col">
          {rows.map((row) => (
            <LinkItem
              key={row.id}
              side={side}
              row={row}
              onChange={(input) => set(row.id, input)}
              onUnlink={() => remove(row.id)}
            />
          ))}
          <AddLink
            side={side}
            linked={rows.map((row) => row.id)}
            onAdd={(otherId) => set(otherId)}
          />
        </div>
      )}
    </QueryState>
  );
};
