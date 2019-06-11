import { mount, shallow } from 'enzyme';
import * as React from 'react';

import PageContent from '../../modules/layout/components/PageContent';

describe('PageContent component', () => {
  const defaultProps = {
    transparent: false
  };

  test('renders PageContent successfully', () => {
    shallow(<PageContent {...defaultProps} />);
  });

  test('renders successfully with default value', () => {
    const wrapper = mount(<PageContent {...defaultProps} />);
    const props = wrapper.props();

    expect(props).toMatchObject(defaultProps);
  });
});
