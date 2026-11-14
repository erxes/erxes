import { Form, Input, Select, Table } from 'erxes-ui';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useRoles } from '../../roles/useRoles';
import { useUserInviteContext } from './InviteMemberContext';
import { InviteRowCheckbox } from './InviteRowCheckbox';
import type { TUserForm } from './inviteSchema';

const INPUT_CLASS_NAME = 'focus-visible:relative focus-visible:z-10';

const MESSAGE_CLASS_NAME = 'absolute top-full -left-px -right-px z-20 m-0!';

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
    <Table.Cell data-invalid={error ? true : undefined}>
      <Form.Field
        control={control}
        name={`entries.${index}.${name}`}
        render={({ field }) => (
          <Form.Item className="relative">
            <Form.Control>
              <Input
                {...field}
                placeholder={placeholder}
                aria-label={placeholder}
                type={name}
                // Someone else's address: the browser shouldn't offer the owner's own.
                autoComplete={name === 'email' ? 'off' : 'new-password'}
                variant="flush"
                className={INPUT_CLASS_NAME}
              />
            </Form.Control>
            <Form.Message variant="solid" className={MESSAGE_CLASS_NAME} />
          </Form.Item>
        )}
      />
    </Table.Cell>
  );
};

/** Every role but owner. */
const InviteRoleCell = ({ index }: { index: number }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'team-member' });
  const { control } = useFormContext<TUserForm>();
  const { roles } = useRoles();

  return (
    <Table.Cell className="w-32">
      <Form.Field
        control={control}
        name={`entries.${index}.role`}
        render={({ field }) => (
          <Form.Item>
            <Select value={field.value} onValueChange={field.onChange}>
              <Form.Control>
                <Select.Trigger variant="flush" className={INPUT_CLASS_NAME} aria-label={t('role')}>
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
  const { selectedUsers } = useUserInviteContext();
  const { t } = useTranslation('settings', { keyPrefix: 'team-member' });

  return (
    <Table.Row
      data-state={selectedUsers.includes(userId) ? 'selected' : 'unselected'}
      className="overflow-hidden h-cell"
    >
      <Table.Cell className="overflow-hidden">
        <div className="w-9 flex items-center justify-center">
          <InviteRowCheckbox userId={userId} />
        </div>
      </Table.Cell>
      <InviteTextCell index={userIndex} name="email" placeholder={t('email')} />
      <InviteTextCell index={userIndex} name="password" placeholder={t('password')} />
      <InviteRoleCell index={userIndex} />
    </Table.Row>
  );
};
