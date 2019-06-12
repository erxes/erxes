import { mount, shallow } from 'enzyme';
import * as React from 'react';
import * as renderer from 'react-test-renderer';

import ImageWithPreview from '../../../modules/common/components/ImageWithPreview';

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

  test('snapshot matches', () => {
    const rendered = renderer
      .create(<ImageWithPreview {...defaultProps} />)
      .toJSON();

    expect(rendered).toMatchSnapshot();
  });

  test('renders successfully with default value', () => {
    const wrapper = mount(<ImageWithPreview {...defaultProps} />);
    const props = wrapper.props();

    expect(props).toMatchObject(defaultProps);
  });
});
