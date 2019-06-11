import { mount, shallow } from 'enzyme';
import * as React from 'react';

import Row from '../../../../modules/tags/components/Row';

describe('Row component', () => {
  const defaultProps = {
    tag: {
      _id: 'id',
      type: 'typ',
      name: 'name',
      colorCode: 'red'
    },
    type: 'type',
    remove: (tag: {
      _id: string;
      type: string;
      name: string;
      colorCode: string;
      objectCount?: number;
    }) => null,
    save: (params: {
      doc: {
        _id?: string;
        name: string;
        type: string;
        colorCode: string;
      };
      callback: () => void;
    }) => null
  };

  test('renders WithPermission successfully', () => {
    shallow(<Row {...defaultProps} />);
  });

  test('renders successfully with default value', () => {
    const wrapper = mount(<Row {...defaultProps} />);
    const props = wrapper.props();

    expect(props).toMatchObject(defaultProps);
  });
});
