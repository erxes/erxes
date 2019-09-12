import { mount, shallow } from 'enzyme';
import React from 'react';

import Button from '../../../modules/common/components/Button';

describe('Button component', () => {
  const defaultProps = {
    btnStyle: 'default',
    size: 'medium',
    block: false,
    type: 'button'
  };

  test('renders successfully', () => {
    shallow(<Button />);
  });

  test('check Element ', () => {
    const props = {
      ...defaultProps,
      href: 'www.google.com'
    };
    const rendered = mount(<Button {...props} />);
    const href = rendered.find('a');

    expect(href.length).toBe(1);
  });
});
