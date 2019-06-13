import { mount, shallow } from 'enzyme';
import * as React from 'react';
import * as renderer from 'react-test-renderer';

import HeadlinesButton from '../../../../modules/common/components/editor/HeadlinesButton';

describe('HeadlinesButton component', () => {
  const defaultProps = {
    onOverrideContent: e => null
  };

  test('renders HeadlinesButton successfully', () => {
    shallow(<HeadlinesButton {...defaultProps} />);
  });

  test('renders successfully with default value', () => {
    const wrapper = mount(<HeadlinesButton {...defaultProps} />);
    const props = wrapper.props();

    expect(props).toMatchObject(defaultProps);
  });

  test('snapshot matches', () => {
    const rendered = renderer
      .create(<HeadlinesButton {...defaultProps} />)
      .toJSON();

    expect(rendered).toMatchSnapshot();
  });
});
