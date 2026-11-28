import type { MemberRestrictions } from '@erxes/core-contract';
import { memberQueries } from '@erxes/core-contract/client';
import { Checkbox, Form, SelectMember } from 'erxes-ui';
import { useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

/** The part of the organisation form these fields edit. */
interface RestrictionValues {
  memberRestrictions: MemberRestrictions;
}

/** A list of members, picked several at a time. */
const MembersField = ({
  name,
  label,
  disabled,
}: {
  name: 'memberRestrictions.allBranchesUserIds' | 'memberRestrictions.allDepartmentsUserIds';
  label: string;
  disabled: boolean;
}) => {
  const { control } = useFormContext<RestrictionValues>();

  return (
    <Form.Field
      control={control}
      name={name}
      render={({ field }) => (
        <Form.Item>
          <Form.Label>{label}</Form.Label>
          <SelectMember.FormItem
            members={memberQueries}
            mode="multiple"
            disabled={disabled}
            value={field.value}
            onValueChange={(ids) => field.onChange(Array.isArray(ids) ? ids : [])}
          />
          <Form.Message />
        </Form.Item>
      )}
    />
  );
};

/**
 * 3.x's "With team member restrictions": while on, members other than owners see the records of
 * their own branches and departments, except the ones listed for every branch or department.
 */
export const MemberRestrictionsFields = ({ disabled }: { disabled: boolean }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'general' });
  const { control } = useFormContext<RestrictionValues>();
  const enabled = useWatch({ control, name: 'memberRestrictions.enabled' });

  return (
    <>
      <Form.Field
        control={control}
        name="memberRestrictions.enabled"
        render={({ field }) => (
          <Form.Item orientation="inline">
            <Form.Control>
              <Checkbox
                checked={field.value}
                disabled={disabled}
                onCheckedChange={(checked) => field.onChange(checked)}
              />
            </Form.Control>
            <Form.Label>
              {t('with-team-member-restrictions', 'With team member restrictions')}
            </Form.Label>
          </Form.Item>
        )}
      />
      {enabled && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <MembersField
            name="memberRestrictions.allBranchesUserIds"
            label={t('team-members-every-branches', 'Team members who can access all branches')}
            disabled={disabled}
          />
          <MembersField
            name="memberRestrictions.allDepartmentsUserIds"
            label={t(
              'team-members-every-departments',
              'Team members who can access all departments',
            )}
            disabled={disabled}
          />
        </div>
      )}
    </>
  );
};
