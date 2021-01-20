import { shallow } from 'enzyme';
import React from 'react';

import ImageWithPreview from '../../../modules/common/components/ImageWithPreview';

describe('ImageWithPreview component', () => {
  const defaultProps = {
    src: 'bb',
    alt: 'bb',
    onLoad: () => null,
    full: false
  };

  test('renders ImageWithPreview successfully', () => {
    const wrapper = shallow(<ImageWithPreview {...defaultProps} />);
    expect(wrapper).not.toBe('');
  });
});
