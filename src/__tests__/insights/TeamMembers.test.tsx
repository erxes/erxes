import { shallow } from 'enzyme';
import React from 'react';

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
});
