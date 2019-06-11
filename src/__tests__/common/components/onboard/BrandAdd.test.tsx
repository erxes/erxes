import { mount, shallow } from 'enzyme';
import * as React from 'react';

import BrandAdd from '../../../../modules/onboard/components/BrandAdd';

describe('BrandAdd component', () => {
  const defaultProps = {
    brandsTotalCount: 0,
    save: (name: string, callback: () => void) => null,
    changeStep: () => null
  };

  test('renders BrandAdd successfully', () => {
    shallow(<BrandAdd {...defaultProps} />);
  });

  test('renders successfully with default value', () => {
    const wrapper = mount(<BrandAdd {...defaultProps} />);
    const props = wrapper.props();

    expect(props).toMatchObject(defaultProps);
  });
});
