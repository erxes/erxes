import { mount, shallow } from 'enzyme';
import * as React from 'react';
import * as renderer from 'react-test-renderer';
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

  test('snapshot matches', () => {
    const rendered = renderer
      .create(<SortableList {...defaultProps} />)
      .toJSON();

    expect(rendered).toMatchSnapshot();
  });
});
