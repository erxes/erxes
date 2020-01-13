import { shallow } from 'enzyme';
import React from 'react';

import Button from '../../../modules/common/components/Button';
import Tip from '../../../modules/common/components/Tip';

describe('FilterToggler component', () => {
  const defaultProps = {
    children: <Button />
  };

  test('renders FilterToggler successfully', () => {
    const wrapper = shallow(<Tip {...defaultProps} />);
    expect(wrapper).not.toBe('');
  });
});
