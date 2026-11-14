import type { PermissionSet } from '@erxes/core-contract';
import { useQuery } from '@tanstack/react-query';
import { Checkbox, cn } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { QueryState } from '~/components/QueryState';
import { orpc } from '@erxes/core-contract/client';

const isIn = (set: PermissionSet, granted: Set<string>) =>
  set.permissions.every((action) => granted.has(action));

/**
 * The installed plugins' ready-made bundles (Frontline agent, Sales rep): ticking one adds all
 * of its permissions to the role, unticking takes them out. A member has one role, so plugins
 * offer these instead of roles of their own.
 */
export const PermissionSets = ({
  granted,
  editable,
  onChange,
}: {
  granted: Set<string>;
  editable: boolean;
  onChange: (actions: string[], on: boolean) => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'roles' });
  const sets = useQuery(orpc.roles.permissionSets.queryOptions({ staleTime: 60_000 }));

  return (
    <QueryState query={sets} className="py-4">
      {({ data }) =>
        data.length ? (
          <section>
            <h3 className="mb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
              {t('sets', 'Ready-made sets')}
            </h3>
            <ul className="space-y-1.5">
              {data.map((set) => (
                <li key={`${set.source}.${set.key}`}>
                  <label
                    className={cn('flex items-start gap-3 text-sm', editable && 'cursor-pointer')}
                  >
                    <Checkbox
                      className="mt-0.5"
                      checked={isIn(set, granted)}
                      disabled={!editable}
                      onCheckedChange={(on) => onChange(set.permissions, on)}
                    />
                    <span className="flex-1">
                      {set.label}
                      <span className="ml-2 text-xs text-muted-foreground">
                        {set.description ??
                          t('set-count', '{{count}} permissions', {
                            count: set.permissions.length,
                          })}
                      </span>
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          </section>
        ) : null
      }
    </QueryState>
  );
};
