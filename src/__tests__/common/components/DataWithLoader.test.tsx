import { mount, shallow } from 'enzyme';
import * as React from 'react';
import * as renderer from 'react-test-renderer';

import DataWithLoader from '../../../modules/common/components/DataWithLoader';

describe('DataWithLoader component', () => {
  const defaultProps = {
    data: 'today',
    loading: false
  };

  test('renders DataWithLoader successfully', () => {
    shallow(<DataWithLoader {...defaultProps} />);
  });

  test('snapshot matches', () => {
    const rendered = renderer
      .create(<DataWithLoader {...defaultProps} />)
      .toJSON();

    expect(rendered).toMatchSnapshot();
  });

  test('renders successfully with default value', () => {
    const wrapper = mount(<DataWithLoader {...defaultProps} />);
    const props = wrapper.props();

    expect(props).toMatchObject(defaultProps);
  });
});
