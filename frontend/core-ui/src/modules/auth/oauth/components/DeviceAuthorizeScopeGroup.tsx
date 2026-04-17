import { IconChevronDown, IconChevronRight } from '@tabler/icons-react';
import { useState } from 'react';

import { Checkbox, Separator } from 'erxes-ui';

import { formatLabel } from '../utils/buildActionGroups';
import type { ActionGroup } from '../types';

type Props = {
  group: ActionGroup;
  groupIndex: number;
  selectedScopes: string[];
  loading: boolean;
  onToggle: (scopes: string[], checked: boolean) => void;
};

export const DeviceAuthorizeScopeGroup = ({
  group,
  groupIndex,
  selectedScopes,
  loading,
  onToggle,
}: Props) => {
  const [open, setOpen] = useState(false);

  const groupScopes = group.modules.flatMap((m) => m.scopes);
  const groupChecked = groupScopes.every((s) => selectedScopes.includes(s.scope));
  const groupIndeterminate =
    !groupChecked && groupScopes.some((s) => selectedScopes.includes(s.scope));

  return (
    <div>
      {groupIndex > 0 ? <Separator /> : null}

      <div className="p-5">
        <div className="flex items-center gap-3">
          <Checkbox
            checked={groupIndeterminate ? 'indeterminate' : groupChecked}
            disabled={loading}
            onCheckedChange={(value) =>
              onToggle(groupScopes.map((s) => s.scope), Boolean(value))
            }
          />

          <button
            type="button"
            className="flex flex-1 items-center justify-between text-left"
            onClick={() => setOpen((prev) => !prev)}
          >
            <span className="text-base font-semibold">{group.title}</span>
            {open ? (
              <IconChevronDown className="size-4 text-muted-foreground" />
            ) : (
              <IconChevronRight className="size-4 text-muted-foreground" />
            )}
          </button>
        </div>

        {open ? (
          <div className="mt-4 space-y-4 pl-7">
            {group.modules.map((moduleGroup) => {
              const moduleChecked = moduleGroup.scopes.every((s) =>
                selectedScopes.includes(s.scope),
              );

              return (
                <div
                  key={`${group.action}-${moduleGroup.module}`}
                  className="space-y-3"
                >
                  <label className="flex items-center gap-3">
                    <Checkbox
                      checked={moduleChecked}
                      disabled={loading}
                      onCheckedChange={(value) =>
                        onToggle(
                          moduleGroup.scopes.map((s) => s.scope),
                          Boolean(value),
                        )
                      }
                    />
                    <span className="text-sm font-medium">
                      {formatLabel(moduleGroup.module)}
                    </span>
                  </label>

                  <div className="space-y-2 pl-7">
                    {moduleGroup.scopes.map((scope) => (
                      <label
                        key={scope.scope}
                        className="flex items-start gap-3 rounded-md border p-3"
                      >
                        <Checkbox
                          checked={selectedScopes.includes(scope.scope)}
                          disabled={loading}
                          onCheckedChange={(value) =>
                            onToggle([scope.scope], Boolean(value))
                          }
                        />
                        <div className="space-y-1">
                          <div className="text-sm font-medium">{scope.scope}</div>
                          <div className="text-sm text-muted-foreground">
                            {scope.description}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : null}
      </div>
    </div>
  );
};
