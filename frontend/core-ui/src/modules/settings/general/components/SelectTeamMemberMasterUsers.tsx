import { Checkbox, Form } from 'erxes-ui';
import { useFormContext, useWatch } from 'react-hook-form';
import { SelectMember } from 'ui-modules';
import { TGeneralSettingsProps } from '../types';

export function SelectTeamMemberMasterUsers() {
  const form = useFormContext<TGeneralSettingsProps>();
  const checkMasterUsers = useWatch({
    control: form.control,
    name: 'CHECK_TEAM_MEMBER_SHOWN',
  });

  return (
    <>
      <Form.Field
        control={form.control}
        name="CHECK_TEAM_MEMBER_SHOWN"
        render={({ field }) => (
          <Form.Item className="flex items-center gap-2 space-y-0">
            <Form.Control>
              <Checkbox
                checked={field.value}
                onCheckedChange={(checked) => field.onChange(!!checked)}
              />
            </Form.Control>
            <Form.Label>With team member restrictions</Form.Label>
            <Form.Message />
          </Form.Item>
        )}
      />
      {checkMasterUsers && (
        <div className="grid grid-cols-2 gap-4">
          <Form.Field
            control={form.control}
            name="BRANCHES_MASTER_TEAM_MEMBERS_IDS"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>Team members who can access every branches</Form.Label>
                <Form.Control>
                  <SelectMember.FormItem
                    mode="multiple"
                    value={field.value || []}
                    onValueChange={(users) =>
                      field.onChange(Array.isArray(users) ? users : [])
                    }
                  />
                </Form.Control>
                <Form.Message />
              </Form.Item>
            )}
          />
          <Form.Field
            control={form.control}
            name="DEPARTMENTS_MASTER_TEAM_MEMBERS_IDS"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>Team members who can access every departments</Form.Label>
                <Form.Control>
                  <SelectMember.FormItem
                    mode="multiple"
                    value={field.value || []}
                    onValueChange={(users) =>
                      field.onChange(Array.isArray(users) ? users : [])
                    }
                  />
                </Form.Control>
                <Form.Message />
              </Form.Item>
            )}
          />
        </div>
      )}
    </>
  );
}
