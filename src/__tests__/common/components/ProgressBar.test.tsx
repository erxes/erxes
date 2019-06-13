import { mount, shallow } from 'enzyme';
import * as React from 'react';
import * as renderer from 'react-test-renderer';

import ProgressBar from '../../../modules/common/components/ProgressBar';

describe('ProgressBar component', () => {
  const defaultProps = {
    percentage: 50
  };

  test('renders shallow successfully', () => {
    shallow(<ProgressBar {...defaultProps} />);
  });

  test('renders mount successfully with default value', () => {
    const wrapper = mount(<ProgressBar {...defaultProps} />);
    const props = wrapper.props();

    expect(props).toMatchObject(defaultProps);
  });
  test('snapshot matches', () => {
    const rendered = renderer
      .create(<ProgressBar {...defaultProps} />)
      .toJSON();

    expect(rendered).toMatchSnapshot();
  });
});
