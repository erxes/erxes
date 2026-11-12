import { cn, Form, Input, Select, Table } from 'erxes-ui';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useRoles } from '../../roles/useRoles';
import { useUserInviteContext } from './InviteMemberContext';
import { InviteRowCheckbox } from './InviteRowCheckbox';
import type { TUserForm } from './inviteSchema';

const INPUT_CLASS_NAME = 'rounded-none focus-visible:relative focus-visible:z-10 shadow-none';

const MESSAGE_CLASS_NAME =
  'text-destructive-foreground absolute top-full -left-px -right-px z-20 bg-destructive m-0! px-2 py-1';

/** One invitation: email, an optional password and the role (old rows had email and password). */
export const InviteRow = ({ userIndex, userId }: { userIndex: number; userId: string }) => {
  const { selectedUsers, fields } = useUserInviteContext();
  const { control, formState } = useFormContext<TUserForm>();
  const { roles } = useRoles();
  const errors = formState.errors.entries?.[userIndex];
  const { t } = useTranslation('settings', { keyPrefix: 'team-member' });
  const first = userIndex === 0;

  return (
    <Table.Row
      data-state={selectedUsers.includes(userId) ? 'selected' : 'unselected'}
      className="overflow-hidden h-cell"
    >
      <Table.Cell
        className={cn('overflow-hidden', {
          'rounded-tl-lg border-t': first,
          'rounded-bl-lg': userIndex === fields.length - 1,
        })}
      >
        <div className="w-9 flex items-center justify-center">
          <InviteRowCheckbox userId={userId} />
        </div>
      </Table.Cell>
      <Table.Cell
        className={cn({ 'border-t': first, 'border-destructive border-l': errors?.email?.message })}
      >
        <Form.Field
          control={control}
          name={`entries.${userIndex}.email`}
          render={({ field }) => (
            <Form.Item className="relative">
              <Form.Control>
                <Input
                  {...field}
                  placeholder={t('email')}
                  type="email"
                  autoComplete="new-email"
                  className={INPUT_CLASS_NAME}
                />
              </Form.Control>
              <Form.Message className={MESSAGE_CLASS_NAME} />
            </Form.Item>
          )}
        />
      </Table.Cell>
      <Table.Cell
        className={cn({
          'border-t': first,
          'border-destructive border-l': errors?.password?.message,
        })}
      >
        <Form.Field
          control={control}
          name={`entries.${userIndex}.password`}
          render={({ field }) => (
            <Form.Item className="relative">
              <Form.Control>
                <Input
                  {...field}
                  placeholder={t('password')}
                  autoComplete="new-password"
                  type="password"
                  className={INPUT_CLASS_NAME}
                />
              </Form.Control>
              <Form.Message className={MESSAGE_CLASS_NAME} />
            </Form.Item>
          )}
        />
      </Table.Cell>
      <Table.Cell
        className={cn('w-32', {
          'border-t rounded-tr-lg': first,
          'rounded-br-lg': userIndex === fields.length - 1,
        })}
      >
        <Form.Field
          control={control}
          name={`entries.${userIndex}.role`}
          render={({ field }) => (
            <Form.Item>
              <Select value={field.value} onValueChange={field.onChange}>
                <Form.Control>
                  <Select.Trigger className={INPUT_CLASS_NAME}>
                    <Select.Value />
                  </Select.Trigger>
                </Form.Control>
                <Select.Content>
                  {roles
                    .filter((role) => role.key !== 'owner')
                    .map((role) => (
                      <Select.Item key={role.key} value={role.key}>
                        {role.name}
                      </Select.Item>
                    ))}
                </Select.Content>
              </Select>
            </Form.Item>
          )}
        />
      </Table.Cell>
    </Table.Row>
  );
};
