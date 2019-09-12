import { shallow } from 'enzyme';
import React from 'react';

import AddConditionButton from '../../modules/segments/components/AddConditionButton';

describe('AddConditionButton component', () => {
  const defaultProps = {
    fields: [],
    addCondition: (condition: { _id: string }) => null
  };

  test('renders AddConditionButton successfully', () => {
    const wrapper = shallow(<AddConditionButton {...defaultProps} />);
    expect(wrapper).not.toBe('');
  });
});
