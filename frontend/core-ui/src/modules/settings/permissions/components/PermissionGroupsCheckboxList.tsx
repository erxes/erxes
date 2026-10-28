import { Checkbox, Label } from 'erxes-ui';
import { useId, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { IPermissionGroup } from '@/settings/permissions/types';
import { groupPermissionGroupsByPlugin } from '@/settings/permissions/utils/groupPermissionGroups';

export const PermissionGroupsCheckboxList = ({
  groups,
  value,
  onValueChange,
  disabled,
}: {
  groups: IPermissionGroup[];
  value: string[];
  onValueChange: (groupIds: string[]) => void;
  disabled?: boolean;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'permissions' });
  const idPrefix = useId();

  const sections = useMemo(() => {
    const { pluginGroups, customGroups } =
      groupPermissionGroupsByPlugin(groups);

    return [
      ...Object.entries(pluginGroups).map(([plugin, items]) => ({
        key: plugin,
        label: plugin,
        items,
      })),
      ...(customGroups.length
        ? [{ key: '', label: t('custom-groups'), items: customGroups }]
        : []),
    ];
  }, [groups, t]);

  const toggle = (groupId: string, checked: boolean) => {
    const rest = value.filter((id) => id !== groupId);

    onValueChange(checked ? [...rest, groupId] : rest);
  };

  if (!groups.length) {
    return (
      <p className="text-sm text-muted-foreground">
        {t('no-permission-groups')}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {sections.map(({ key, label, items }) => (
        <div key={key} className="space-y-2">
          <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </div>
          <div className="space-y-2">
            {items.map((group) => {
              const inputId = `${idPrefix}-${group._id}`;

              return (
                <div
                  key={group._id}
                  className="flex items-start gap-3 rounded-md border border-border px-3 py-2.5"
                >
                  <Checkbox
                    id={inputId}
                    checked={value.includes(group._id)}
                    disabled={disabled}
                    onCheckedChange={(checked) =>
                      toggle(group._id, checked === true)
                    }
                  />
                  <div className="min-w-0 flex-1">
                    <Label
                      variant="peer"
                      htmlFor={inputId}
                      className="block cursor-pointer text-sm font-medium"
                    >
                      {group.name}
                    </Label>
                    {group.description && (
                      <p className="mt-1 text-sm text-muted-foreground">
                        {group.description}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};
