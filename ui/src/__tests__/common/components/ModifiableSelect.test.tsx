import { mount, shallow } from 'enzyme';
import React from 'react';

import ModifiableSelect from '../../../modules/common/components/ModifiableSelect';

describe('Testing ModifiableSelect component', () => {
  let select;
  const defaultProps = {
    options: ['11111111', '22222222'],
    value: '80',
    placeholder: 'phone',
    buttonText: 'add',
    adding: false,
    onChange: (params: { options: any[]; selectedOption: any }) => null
  };

  beforeEach(() => {
    select = mount(<ModifiableSelect {...defaultProps} />);
  });

  afterEach(() => {
    select.unmount();
  });

  test('renders successfully', () => {
    shallow(<ModifiableSelect {...defaultProps} />);
  });

  test('properly renders add button', () => {
    const initialState: any = select.state();

    // renders add button only
    if (!initialState.adding) {
      const buttons = select.find('button');

      expect(buttons.length).toBe(1);
    }
  });

  test('properly renders input with save & cancel buttons', () => {
    const props = {
      ...defaultProps,
      adding: true
    };

    const modifiableSelect = mount(<ModifiableSelect {...props} />);
    const initialState: any = modifiableSelect.state();

    // renders input with save & cancel buttons
    if (initialState.adding) {
      const buttons = modifiableSelect.find('button');

      expect(buttons.length).toBe(2);
    }
  });

  test('properly adds item to option state', () => {
    const initialState: any = select.state();

    // clicking add button
    const addButton = select.find('span').at(3);
    addButton.simulate('click');

    // clicking save button
    const saveButton = select.find('button').at(1);
    saveButton.simulate('click');

    const changedState: any = select.state();

    expect(changedState.options.length).toBeGreaterThan(
      initialState.options.length
    );
  });

  test('handleAdding() functions properly', () => {
    const instance: any = select.instance();

    instance.handleAdding();

    const state: any = select.state();

    expect(state.adding).toBe(true);
  });

  test('handleCancelAdding() functions properly', () => {
    const instance: any = select.instance();

    instance.handleCancelAdding();

    const state: any = select.state();

    expect(state.adding).toBe(false);
  });

  test('removeItem() functions properly', () => {
    const instance: any = select.instance();

    instance.removeItem(defaultProps.options[0]);

    const state: any = select.state();

    expect(state.options).not.toContain(defaultProps.options[0]);
    expect(state.selectedOption).toBe('');
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
