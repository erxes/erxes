// test passed
import { shallow } from 'enzyme';
import Scheduler from 'modules/engage/components/Scheduler';
import { IEngageScheduleDate } from 'modules/engage/types';
import React from 'react';

describe('Scheduler component', () => {
  const testIEngageScheduleDate: IEngageScheduleDate = {
    type: 'string',
    month: 'string',
    day: 'string',
    dateTime: 'string'
  };

  const defaultProps = {
    scheduleDate: testIEngageScheduleDate,
    onChange: (name: 'scheduleDate', value?: IEngageScheduleDate) => null
  };

  test('renders successfully', () => {
    const wrapper = shallow(<Scheduler {...defaultProps} />);
    expect(wrapper).not.toBe('');
  });
});
