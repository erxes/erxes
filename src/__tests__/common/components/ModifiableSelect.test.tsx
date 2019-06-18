import { mount, shallow } from 'enzyme';
import * as React from 'react';
import * as renderer from 'react-test-renderer';

import ModifiableSelect from '../../../modules/common/components/ModifiableSelect';

describe('Modifiable component', () => {
  const defaultProps = {
    options: ['80201929', '99999999'],
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

  test('check Modifiliable', () => {
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

  test('check state', () => {
    const wrapper = mount(<ModifiableSelect {...defaultProps} />);
    const addButton = wrapper.find('span').at(3);
    addButton.simulate('click');

    const saveButton = wrapper.find('button').at(1);
    saveButton.simulate('click');

    expect(wrapper.state('options')).not.toEqual(defaultProps.options);
  });
});
