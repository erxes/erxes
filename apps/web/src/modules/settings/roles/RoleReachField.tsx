import { RoleReach } from '@erxes/core-contract';
import { Label, RadioGroup } from 'erxes-ui';
import { useId } from 'react';
import { useTranslation } from 'react-i18next';

const useReachText = (): Record<RoleReach, { label: string; hint: string }> => {
  const { t } = useTranslation('settings', { keyPrefix: 'roles.reach' });

  return {
    organization: {
      label: t('organization', 'The whole organisation'),
      hint: t('organization-hint', 'Every unit, and what the organisation shares.'),
    },
    subtree: {
      label: t('subtree', 'Their units and the units under them'),
      hint: t('subtree-hint', 'A district manager: the district and each store in it.'),
    },
    unit: {
      label: t('unit', 'Their units only'),
      hint: t('unit-hint', 'A store manager: their store, not the store beside it.'),
    },
    own: {
      label: t('own', 'Only what they own'),
      hint: t('own-hint', 'A sales rep: the customers and companies they own.'),
    },
  };
};

/** Where a role's permissions hold: all of the organisation, or the member's part of the structure. */
export const RoleReachField = ({
  value,
  editable,
  onChange,
}: {
  value: RoleReach;
  editable: boolean;
  onChange: (reach: RoleReach) => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'roles.reach' });
  const id = useId();
  const text = useReachText();

  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-medium">{t('title', 'Reach')}</legend>
      <p className="text-sm text-muted-foreground">
        {t(
          'description',
          'Where members with this role see and change records, the team and the structure.',
        )}
      </p>
      <RadioGroup
        value={value}
        disabled={!editable}
        onValueChange={(next) => {
          const reach = RoleReach.safeParse(next);

          if (reach.success) onChange(reach.data);
        }}
      >
        {RoleReach.options.map((reach) => (
          <div key={reach} className="flex items-start gap-2 rounded-lg border p-3">
            <RadioGroup.Item id={`${id}-${reach}`} value={reach} />
            <div className="flex flex-col gap-0.5">
              <Label htmlFor={`${id}-${reach}`} variant="plain">
                {text[reach].label}
              </Label>
              <p className="text-sm text-muted-foreground">{text[reach].hint}</p>
            </div>
          </div>
        ))}
      </RadioGroup>
    </fieldset>
  );
};
