import { mount, shallow } from 'enzyme';
import React from 'react';

import Label from '../../../modules/common/components/Label';

describe('Label component', () => {
  const defaultProps = {
    children: '',
    className: 'default',
    shake: true,
    ignoreTrans: true,
    lblStyle: 'default'
  };

  test('renders Label successfully', () => {
    shallow(<Label {...defaultProps} />);
  });
});
