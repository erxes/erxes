import { shallow } from 'enzyme';
import React from 'react';

import ImageWithPreview from '../../../modules/common/components/ImageWithPreview';

describe('ImageWithPreview component', () => {
  const defaultProps = {
    images: [{ name: '', url: '', type: '' }],
    onLoad: () => null
  };

  test('renders ImageWithPreview successfully', () => {
    const wrapper = shallow(<ImageWithPreview {...defaultProps} />);
    expect(wrapper).not.toBe('');
  });
});
