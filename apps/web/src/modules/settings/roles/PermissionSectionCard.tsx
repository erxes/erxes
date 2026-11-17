import type { PermissionInfo, PermissionSet } from '@erxes/core-contract';
import { Badge, Button, Checkbox, cn, Collapsible } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { countGranted, type PermissionGroup, type PermissionSection } from './permissionSections';

/** Adds (`on`) or takes out the actions from the role being edited. */
export type Toggle = (actions: string[], on: boolean) => void;

/** The actions an editor may tick: owner-only ones stay with owners. */
const toggleable = (permissions: PermissionInfo[]) =>
  permissions.filter((permission) => !permission.ownerOnly).map((permission) => permission.action);

/** A select-all box over the actions: ticked, unticked or partly. */
const AllBox = ({
  actions,
  granted,
  editable,
  label,
  onChange,
}: {
  actions: string[];
  granted: Set<string>;
  editable: boolean;
  label: string;
  onChange: Toggle;
}) => {
  const count = countGranted(actions, granted);

  return (
    <Checkbox
      aria-label={label}
      checked={actions.length > 0 && count === actions.length}
      indeterminate={count > 0 && count < actions.length}
      disabled={!editable || actions.length === 0}
      onCheckedChange={() => onChange(actions, count < actions.length)}
    />
  );
};

const Count = ({ count, total }: { count: number; total: number }) => (
  <span
    className={cn(
      'shrink-0 text-xs tabular-nums',
      count ? 'text-foreground' : 'text-muted-foreground',
    )}
  >
    {count} / {total}
  </span>
);

const PermissionRow = ({
  permission,
  granted,
  editable,
  onChange,
}: {
  permission: PermissionInfo;
  granted: Set<string>;
  editable: boolean;
  onChange: Toggle;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'roles' });
  const locked = !editable || permission.ownerOnly;

  return (
    <label
      className={cn(
        'flex items-start gap-2.5 rounded-sm px-2 py-1.5 text-sm',
        !locked && 'cursor-pointer hover:bg-muted/60',
      )}
    >
      <Checkbox
        className="mt-0.5"
        checked={granted.has(permission.action)}
        disabled={locked}
        onCheckedChange={(on) => onChange([permission.action], on)}
      />
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-x-2">
          {permission.label}
          {permission.ownerOnly && (
            <Badge variant="secondary">{t('owner-only', 'Owner only')}</Badge>
          )}
        </span>
        {permission.description && (
          <span className="block text-xs text-muted-foreground">{permission.description}</span>
        )}
        <span className="block truncate font-mono text-2xs text-muted-foreground/80">
          {permission.action}
        </span>
      </span>
    </label>
  );
};

const GroupBlock = ({
  group,
  granted,
  editable,
  onChange,
}: {
  group: PermissionGroup;
  granted: Set<string>;
  editable: boolean;
  onChange: Toggle;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'roles' });
  const actions = group.permissions.map((permission) => permission.action);

  return (
    <section className="py-2">
      <div className="flex items-center gap-2.5 px-2 pb-1">
        <AllBox
          actions={toggleable(group.permissions)}
          granted={granted}
          editable={editable}
          label={t('select-all-in', 'All of {{name}}', { name: group.name })}
          onChange={onChange}
        />
        <h4 className="flex-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {group.name}
        </h4>
        <Count count={countGranted(actions, granted)} total={actions.length} />
      </div>
      <div className="grid gap-x-4 pl-5 md:grid-cols-2">
        {group.permissions.map((permission) => (
          <PermissionRow
            key={permission.action}
            permission={permission}
            granted={granted}
            editable={editable}
            onChange={onChange}
          />
        ))}
      </div>
    </section>
  );
};

/** A plugin's ready-made bundles as chips: one adds or takes out all of its permissions. */
const SetChips = ({
  sets,
  granted,
  editable,
  onChange,
}: {
  sets: PermissionSet[];
  granted: Set<string>;
  editable: boolean;
  onChange: Toggle;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'roles' });

  return (
    <div className="flex flex-wrap items-center gap-1.5 border-t px-4 py-2.5">
      <span className="mr-1 text-xs text-muted-foreground">{t('sets', 'Ready-made sets')}</span>
      {sets.map((set) => {
        const on = set.permissions.every((action) => granted.has(action));

        return (
          <Button
            key={set.key}
            size="sm"
            variant={on ? 'secondary' : 'outline'}
            aria-pressed={on}
            disabled={!editable}
            title={
              set.description ??
              t('set-count', '{{count}} permissions', { count: set.permissions.length })
            }
            onClick={() => onChange(set.permissions, !on)}
          >
            <Checkbox checked={on} tabIndex={-1} aria-hidden className="pointer-events-none" />
            {set.label}
          </Button>
        );
      })}
    </div>
  );
};

export const SectionCard = ({
  section,
  open,
  granted,
  editable,
  onOpenChange,
  onChange,
}: {
  section: PermissionSection;
  open: boolean;
  granted: Set<string>;
  editable: boolean;
  onOpenChange: (open: boolean) => void;
  onChange: Toggle;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'roles' });
  const visible = section.groups.flatMap((group) => group.permissions);

  return (
    <div className="rounded-md border bg-background">
      <Collapsible open={open} onOpenChange={onOpenChange} className="group">
        <div className="flex items-center gap-2.5 px-3 py-2">
          <AllBox
            actions={toggleable(visible)}
            granted={granted}
            editable={editable}
            label={t('select-all-in', 'All of {{name}}', { name: section.title })}
            onChange={onChange}
          />
          <Collapsible.Trigger
            render={<Button variant="ghost" className="min-w-0 flex-1 justify-start" />}
          >
            <Collapsible.TriggerIcon className="size-3 shrink-0" />
            <span className="truncate font-medium">{section.title}</span>
            {section.source !== 'core' && (
              <span className="truncate font-mono text-xs font-normal text-muted-foreground">
                {section.source}
              </span>
            )}
          </Collapsible.Trigger>
          <Count count={countGranted(section.actions, granted)} total={section.actions.length} />
        </div>
        <Collapsible.Panel>
          {section.sets.length > 0 && (
            <SetChips
              sets={section.sets}
              granted={granted}
              editable={editable}
              onChange={onChange}
            />
          )}
          <div className="divide-y border-t px-2">
            {section.groups.map((group) => (
              <GroupBlock
                key={group.name}
                group={group}
                granted={granted}
                editable={editable}
                onChange={onChange}
              />
            ))}
          </div>
        </Collapsible.Panel>
      </Collapsible>
    </div>
  );
};
