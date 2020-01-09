import { shallow } from 'enzyme';
import React from 'react';

import Label from '../../../../modules/common/components/form/Label';

describe('Label component', () => {
  const defaultProps = {
    children: false
  };

  test('renders Label successfully', () => {
    const wrapper = shallow(<Label {...defaultProps} />);
    expect(wrapper).not.toBe('');
  });
});
