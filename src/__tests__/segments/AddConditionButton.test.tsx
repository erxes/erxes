import { mount, shallow } from 'enzyme';
import * as React from 'react';

import AddConditionButton from '../../modules/segments/components/AddConditionButton';

describe('AddConditionButton component', () => {
  const defaultProps = {
    fields: [],
    addCondition: (condition: { _id: string }) => null
  };

  test('renders AddConditionButton successfully', () => {
    shallow(<AddConditionButton {...defaultProps} />);
  });

  test('renders successfully with default value', () => {
    const wrapper = mount(<AddConditionButton {...defaultProps} />);
    const props = wrapper.props();

    expect(props).toMatchObject(defaultProps);
  });
});
