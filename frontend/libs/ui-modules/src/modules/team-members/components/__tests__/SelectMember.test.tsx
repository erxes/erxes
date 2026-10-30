/** @jest-environment jsdom */
import { fireEvent, render, screen, within } from '@testing-library/react';
import type { ReactNode, Ref } from 'react';
import { SelectMember } from '../SelectMember';
import { IUser } from '../../types/TeamMembers';
import { FieldRelation } from '../../../properties/components/FieldRelation';

jest.mock('ui-modules/modules/contacts', () => ({}));
jest.mock('ui-modules/modules/products', () => ({}));
jest.mock('ui-modules/modules/structure', () => ({}));
jest.mock('ui-modules/modules/team-members', () =>
  jest.requireActual('../SelectMember'),
);

jest.mock('@apollo/client', () => ({
  ...jest.requireActual('@apollo/client'),
  useSubscription: () => ({}),
}));
jest.mock('ui-modules/modules', () => ({
  useUsers: () => ({ users: [], loading: false, totalCount: 0 }),
}));
jest.mock('ui-modules/states', () => ({
  currentUserState: jest
    .requireActual<typeof import('jotai')>('jotai')
    .atom(null),
}));
jest.mock('../MembersInline', () => ({
  MembersInline: ({
    members = [],
    showInactive,
    placeholder,
  }: {
    members?: IUser[];
    showInactive?: boolean;
    placeholder?: string;
  }) => (
    <span>
      {members
        .filter((member) => showInactive || member.isActive !== false)
        .map((member) => member.details?.fullName)
        .join(', ') || placeholder}
    </span>
  ),
}));
jest.mock('erxes-ui', () => {
  const React = jest.requireActual<typeof import('react')>('react');
  const Content = ({ children }: { children?: ReactNode }) => (
    <div>{children}</div>
  );
  const Trigger = React.forwardRef(
    ({ children }: { children?: ReactNode }, ref: Ref<HTMLButtonElement>) => (
      <button ref={ref} data-testid="selected-member">
        {children}
      </button>
    ),
  );
  return {
    cn: () => '',
    PopoverScoped: Content,
    RecordTableInlineCell: { Trigger, Content },
    Combobox: {
      Trigger,
      Content,
      Check: () => null,
      Empty: () => null,
      FetchMore: () => null,
    },
    Command: Object.assign(Content, {
      Input: () => null,
      List: Content,
      Separator: () => null,
      Item: ({
        children,
        onSelect,
      }: {
        children?: ReactNode;
        onSelect: () => void;
      }) => <button onClick={onSelect}>{children}</button>,
    }),
  };
});

const inactiveMember: IUser = {
  _id: 'inactive-member',
  isActive: false,
  isOnboarded: true,
  details: { fullName: 'Former member' },
};

describe.each([
  ['regular', SelectMember],
  ['inline', SelectMember.InlineCell],
] as const)('%s member relation', (_name, Component) => {
  it('shows a saved inactive member and lets the user clear the relation', () => {
    const onValueChange = jest.fn();
    render(
      <Component
        mode="single"
        value={inactiveMember._id}
        members={[inactiveMember]}
        onValueChange={onValueChange}
        allowUnassigned
        showInactive
      />,
    );

    expect(
      within(screen.getByTestId('selected-member')).getByText('Former member'),
    ).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Unnamed user' }));
    expect(onValueChange).toHaveBeenCalledWith(null);
  });
});

describe.each(['core:user', 'core:teamMembers'])(
  '%s property',
  (relationType) => {
    describe.each([false, true])('inCell=%s', (inCell) => {
      it.each([
        { validations: { required: true }, isRequired: false, canClear: false },
        { validations: { required: false }, isRequired: false, canClear: true },
        { validations: { required: false }, isRequired: true, canClear: true },
      ])(
        'only allows clearing when validation permits it: %j',
        ({ validations, isRequired, canClear }) => {
          const handleChange = jest.fn();
          render(
            <FieldRelation
              field={{
                _id: 'member-field',
                name: 'Member',
                code: 'member',
                type: 'relation',
                relationType,
                validations,
                isRequired,
              }}
              id="record"
              value={inactiveMember._id}
              inCell={inCell}
              loading={false}
              handleChange={handleChange}
            />,
          );

          const clear = screen.queryByRole('button', { name: 'Unnamed user' });
          if (canClear) {
            expect(clear).not.toBeNull();
            fireEvent.click(
              screen.getByRole('button', { name: 'Unnamed user' }),
            );
            expect(handleChange).toHaveBeenCalledWith(null);
          } else {
            expect(clear).toBeNull();
            expect(handleChange).not.toHaveBeenCalled();
          }
        },
      );
    });
  },
);
