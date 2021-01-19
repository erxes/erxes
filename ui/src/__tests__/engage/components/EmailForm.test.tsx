// test passed
import { shallow } from 'enzyme';
import { IUser } from 'modules/auth/types';
import EmailForm from 'modules/engage/components/EmailForm';
import { IEngageEmail, IEngageScheduleDate } from 'modules/engage/types';
import { IEmailTemplate } from 'modules/settings/emailTemplates/types';
import React from 'react';

describe('EmailForm component', () => {
  const testUsers: IUser[] = [
    {
      _id: 'u123',
      username: 'john',
      email: 'J@a.co'
    },
    {
      _id: 'u124',
      username: 'kate',
      email: 'Jq@a.co'
    }
  ];

  const testIEmailTemplate: IEmailTemplate[] = [
    {
      _id: 'email1',
      name: 'string',
      content: 'string'
    },
    {
      _id: 'email2',
      name: 'string',
      content: 'string'
    }
  ];

  const testIEngageEmail: IEngageEmail = {
    subject: 'string',
    content: 'string'
  };

  const testIEngageScheduleDate: IEngageScheduleDate = {
    type: 'string',
    month: 'string',
    day: 'string',
    dateTime: 'string'
  };

  const sendTestEmail = () => {
    console.log('test email');
  };

  const defaultProps = {
    onChange: (
      name: 'email' | 'content' | 'fromUserId' | 'scheduleDate',
      value?: IEngageEmail | IEngageScheduleDate | string
    ) => null,
    message: 'string',
    users: testUsers,
    templates: testIEmailTemplate,
    kind: 'string',
    email: testIEngageEmail,
    fromUserId: 'string',
    content: 'string',
    scheduleDate: testIEngageScheduleDate,
    verifiedEmails: [],
    sendTestEmail
  };

  test('renders successfully', () => {
    const wrapper = shallow(<EmailForm {...defaultProps} />);
    expect(wrapper).not.toBe('');
  });
});
