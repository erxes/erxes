// test passed
import { mount, shallow } from 'enzyme';
import { IUser } from 'modules/auth/types';
import UserCounter from 'modules/deals/components/portable/UserCounter';
import * as React from 'react';

describe('UserCounter component', () => {
  const testUsers: IUser[] = [
    {
      _id: 'u123',
      username: 'john',
      email: 'J@a.co',
      details: { fullName: 'Test Name' }
    },
    {
      _id: 'u124',
      username: 'marco',
      email: 'Jq@a.co'
    }
  ];

  const defaultProps = {
    users: testUsers
  };

  test('renders shallow successfully', () => {
    shallow(<UserCounter {...defaultProps} />);
  });

  test('renders mount with default props', () => {
    const control = mount(<UserCounter {...defaultProps} />);
    const props = control.props();

    expect(props).toMatchObject(defaultProps);
  });
});
