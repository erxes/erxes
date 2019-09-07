import { mount, shallow } from 'enzyme';
import React from 'react';

import AddConditionButton from '../../modules/segments/components/AddConditionButton';

describe('AddConditionButton component', () => {
  const defaultProps = {
    fields: [],
    addCondition: (condition: { _id: string }) => null
  };

  test('renders AddConditionButton successfully', () => {
    shallow(<AddConditionButton {...defaultProps} />);
  });
});
