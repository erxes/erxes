import { mount, shallow } from 'enzyme';
import * as React from 'react';
import * as renderer from 'react-test-renderer';

import Button from '../../../modules/common/components/Button';
import Tip from '../../../modules/common/components/Tip';

describe('FilterToggler component', () => {
  const defaultProps = {
    children: <Button />
  };

  test('renders FilterToggler successfully', () => {
    shallow(<Tip {...defaultProps} />);
  });

  test('renders successfully with default value', () => {
    const wrapper = mount(<Tip {...defaultProps} />);
    const props = wrapper.props();

    expect(props).toMatchObject(defaultProps);
  });

  test('snapshot matches', () => {
    const rendered = renderer.create(<Tip {...defaultProps} />).toJSON();

    expect(rendered).toMatchSnapshot();
  });
});
