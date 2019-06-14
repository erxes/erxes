// test passed
import { mount, shallow } from 'enzyme';
import Scheduler from 'modules/engage/components/Scheduler';
import { IEngageScheduleDate } from 'modules/engage/types';
import * as React from 'react';
import * as renderer from 'react-test-renderer';

describe('Scheduler component', () => {
  const testIEngageScheduleDate: IEngageScheduleDate = {
    type: 'string',
    month: 'string',
    day: 'string',
    time: new Date()
  };

  const defaultProps = {
    scheduleDate: testIEngageScheduleDate,
    onChange: (name: 'scheduleDate', value: IEngageScheduleDate) => null
  };

  test('renders successfully', () => {
    shallow(<Scheduler {...defaultProps} />);
  });

  test('renders with default props', () => {
    const control = mount(<Scheduler {...defaultProps} />);
    const props = control.props();

    expect(props).toMatchObject(defaultProps);
  });

  test('snapshot matches', () => {
    const rendered = renderer.create(<Scheduler {...defaultProps} />).toJSON();

    expect(rendered).toMatchSnapshot();
  });
});
