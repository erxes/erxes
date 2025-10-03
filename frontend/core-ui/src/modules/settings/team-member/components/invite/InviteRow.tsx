import { IUserEntry, TUserForm } from '../../types';
import { useUserInviteContext } from '../../hooks/useUserInviteContext';
import { InviteMemberRowContext } from '../../context/InviteMemberContext';
import { cn, Form, Input, Table } from 'erxes-ui';
import { InviteRowCheckbox } from './InviteRowCheckbox';
import { useFormContext } from 'react-hook-form';
import {
  SelectBranches,
  SelectDepartments,
  SelectUnit,
  SelectUsersGroup,
} from 'ui-modules';

export const InviteRow = ({
  userIndex,
  user,
}: {
  userIndex: number;
  user: IUserEntry & { id: string };
}) => {
  const { selectedUsers, fields } = useUserInviteContext();
  const { control, formState } = useFormContext<TUserForm>();
  const { errors } = formState;
  return (
    <InviteMemberRowContext.Provider
      value={{
        userIndex,
        user,
      }}
    >
      <Table.Row
        key={user.id}
        data-state={
          selectedUsers?.includes(user.id) ? 'selected' : 'unselected'
        }
        className="overflow-hidden h-cell"
      >
        <Table.Cell
          className={cn('overflow-hidden', {
            'rounded-tl-lg border-t': userIndex === 0,
            'rounded-bl-lg': userIndex === fields?.length - 1,
          })}
        >
          <div className="w-9 flex items-center justify-center">
            <InviteRowCheckbox userId={user.id} />
          </div>
        </Table.Cell>
        <Table.Cell
          className={cn({
            'border-t': userIndex === 0,
          })}
        >
          <Form.Field
            control={control}
            name={`entries.${userIndex}.email`}
            render={({ field }) => (
              <Form.Item>
                <Form.Control>
                  <Input
                    {...field}
                    placeholder="Email"
                    type={'email'}
                    autoComplete="new-email"
                    className={cn(
                      'rounded-none focus-visible:relative focus-visible:z-10 shadow-none',
                    )}
                  />
                </Form.Control>
              </Form.Item>
            )}
          />
        </Table.Cell>
        <Table.Cell
          className={cn({
            'border-t': userIndex === 0,
            'border-destructive border-l':
              errors?.entries?.[userIndex]?.password?.message,
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
                    placeholder="Password"
                    autoComplete={`new-password`}
                    type="password"
                    className={cn(
                      'rounded-none focus-visible:relative focus-visible:z-10 shadow-none',
                    )}
                  />
                </Form.Control>
                <Form.Message className="text-destructive-foreground absolute top-full -left-px -right-px bg-destructive !m-0 px-2 py-1" />
              </Form.Item>
            )}
          />
        </Table.Cell>
      </Table.Row>
    </InviteMemberRowContext.Provider>
  );
};
