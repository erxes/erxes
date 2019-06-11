import { mount, shallow } from 'enzyme';
import * as React from 'react';

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

  test('renders successfully with default value', () => {
    const wrapper = mount(<Label {...defaultProps} />);
    const props = wrapper.props();

    expect(props).toMatchObject(defaultProps);
  });
});
