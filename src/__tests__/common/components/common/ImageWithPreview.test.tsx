import { mount, shallow } from 'enzyme';
import * as React from 'react';

import ImageWithPreview from '../../../../modules/common/components/ImageWithPreview';

describe('ImageWithPreview component', () => {
  const defaultProps = {
    src: 'bb',
    alt: 'bb',
    onLoad: () => null,
    full: false
  };

  test('renders ImageWithPreview successfully', () => {
    shallow(<ImageWithPreview />);
  });

  test('renders successfully with default value', () => {
    const wrapper = mount(<ImageWithPreview {...defaultProps} />);
    const props = wrapper.props();

    expect(props).toMatchObject(defaultProps);
  });
});
