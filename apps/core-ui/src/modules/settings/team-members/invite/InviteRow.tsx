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

/** The row's email or password, its error shown under the cell. */
const InviteTextCell = ({
  index,
  name,
  placeholder,
}: {
  index: number;
  name: 'email' | 'password';
  placeholder: string;
}) => {
  const { control, formState } = useFormContext<TUserForm>();
  const error = formState.errors.entries?.[index]?.[name]?.message;

  return (
    <Table.Cell className={cn({ 'border-t': index === 0, 'border-destructive border-l': error })}>
      <Form.Field
        control={control}
        name={`entries.${index}.${name}`}
        render={({ field }) => (
          <Form.Item className="relative">
            <Form.Control>
              <Input
                {...field}
                placeholder={placeholder}
                type={name}
                autoComplete={name === 'email' ? 'new-email' : 'new-password'}
                className={INPUT_CLASS_NAME}
              />
            </Form.Control>
            <Form.Message className={MESSAGE_CLASS_NAME} />
          </Form.Item>
        )}
      />
    </Table.Cell>
  );
};

/** Every role but owner. */
const InviteRoleCell = ({ index, last }: { index: number; last: boolean }) => {
  const { control } = useFormContext<TUserForm>();
  const { roles } = useRoles();

  return (
    <Table.Cell
      className={cn('w-32', { 'border-t rounded-tr-lg': index === 0, 'rounded-br-lg': last })}
    >
      <Form.Field
        control={control}
        name={`entries.${index}.role`}
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
  );
};

/** One invitation: email, an optional password and the role. */
export const InviteRow = ({ userIndex, userId }: { userIndex: number; userId: string }) => {
  const { selectedUsers, fields } = useUserInviteContext();
  const { t } = useTranslation('settings', { keyPrefix: 'team-member' });
  const last = userIndex === fields.length - 1;

  return (
    <Table.Row
      data-state={selectedUsers.includes(userId) ? 'selected' : 'unselected'}
      className="overflow-hidden h-cell"
    >
      <Table.Cell
        className={cn('overflow-hidden', {
          'rounded-tl-lg border-t': userIndex === 0,
          'rounded-bl-lg': last,
        })}
      >
        <div className="w-9 flex items-center justify-center">
          <InviteRowCheckbox userId={userId} />
        </div>
      </Table.Cell>
      <InviteTextCell index={userIndex} name="email" placeholder={t('email')} />
      <InviteTextCell index={userIndex} name="password" placeholder={t('password')} />
      <InviteRoleCell index={userIndex} last={last} />
    </Table.Row>
  );
};
