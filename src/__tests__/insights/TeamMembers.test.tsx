import { mount, shallow } from 'enzyme';
import * as React from 'react';

import TeamMembers from '../../modules/insights/components/TeamMembers';

describe('TeamMembers component', () => {
  const defaultProps = {
    datas: [
      {
        x: 'length',
        y: 0,
        graph: []
      }
    ],
    loading: false
  };

  test('renders TeamMembers successfully', () => {
    shallow(<TeamMembers {...defaultProps} />);
  });

  test('renders successfully with default value', () => {
    const wrapper = mount(<TeamMembers {...defaultProps} />);
    const props = wrapper.props();

    expect(props).toMatchObject(defaultProps);
  });
});
