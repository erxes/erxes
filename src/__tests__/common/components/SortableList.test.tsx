import { mount, shallow } from 'enzyme';
import React from 'react';
import SortableList from '../../../modules/common/components/SortableList';

describe('SortableList component', () => {
  const defaultProps = {
    fields: [],
    child: (field: any) => null,
    onChangeFields: (reorderedFields: any) => null,
    content: ''
  };

  test('renders successfully', () => {
    shallow(<SortableList {...defaultProps} />);
  });

  test('renders with default props', () => {
    const control = mount(<SortableList {...defaultProps} />);
    const props = control.props();

    expect(props).toMatchObject(defaultProps);
  });
});
