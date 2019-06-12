import { mount, shallow } from 'enzyme';
import * as React from 'react';
import * as renderer from 'react-test-renderer';

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

  test('renders shallow successfully', () => {
    shallow(<ModifiableSelect {...defaultProps} />);
  });

  test('renders with default props', () => {
    const control = mount(<ModifiableSelect {...defaultProps} />);
    const props = control.props();

    expect(props).toMatchObject(defaultProps);
  });

  test('renders mount test 2 different props', () => {
    defaultProps.buttonText = 'Add name';
    defaultProps.placeholder = 'Primary name';

    const rendered = mount(<ModifiableSelect {...defaultProps} />);
    const props = rendered.props();

    expect(defaultProps).toMatchObject(props);
  });

  test('render expect Modifiliable', () => {
    const rendered = mount(<ModifiableSelect {...defaultProps} />);
    const found = rendered.find('span').debug();
    const founded = found.search('className="Select-placeholder"');
    expect(founded).toBeGreaterThan(-1);
  });

  test('snapshot matches', () => {
    const rendered = renderer
      .create(<ModifiableSelect {...defaultProps} />)
      .toJSON();

    expect(rendered).toMatchSnapshot();
  });
});
