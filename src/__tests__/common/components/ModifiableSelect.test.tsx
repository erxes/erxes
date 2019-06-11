import { mount, shallow } from 'enzyme';
import * as React from 'react';
import ModifiableSelect from '../../../modules/common/components/ModifiableSelect';

describe('Modifiable component', () => {
  const defaultProps = {
    options: [],
    value: '80',
    placeholder: 'phone',
    buttonText: 'add',
    adding: false,
    onChange: (params: { options: any[]; selectedOption: any }) => null
  };

  test('renders successfully', () => {
    shallow(<ModifiableSelect {...defaultProps} />);
  });

  test('renders with default props', () => {
    const control = mount(<ModifiableSelect {...defaultProps} />);
    const props = control.props();

    expect(props).toMatchObject(defaultProps);
  });

  test('renders test 2 different props', () => {
    defaultProps.buttonText = 'Add name';
    defaultProps.placeholder = 'Primary name';

    const rendered = mount(<ModifiableSelect {...defaultProps} />);
    const props = rendered.props();

    expect(defaultProps).toMatchObject(props);
  });

  test('render piggy Modifiliable', () => {
    const rendered = mount(<ModifiableSelect {...defaultProps} />);
    const found = rendered.find('span').debug();
    const piggyFound = found.search('className="Select-placeholder"');
    expect(piggyFound).toBeGreaterThan(-1);
  });
});
