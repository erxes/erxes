import { mount, shallow } from 'enzyme';
import * as React from 'react';
import * as renderer from 'react-test-renderer';
import DealAddForm from '../../../modules/deals/components/DealAddForm';

describe('DealAddForm component', () => {
  const defaultProps = {
    add: (name: string, callback: () => void) => null,
    closeModal: () => null
  };

  test('renders successfully', () => {
    shallow(<DealAddForm {...defaultProps} />);
  });

  test('renders with default props', () => {
    const control = mount(<DealAddForm {...defaultProps} />);
    const props = control.props();

    expect(props).toMatchObject(defaultProps);
  });

  test('snapshot matches', () => {
    const rendered = renderer
      .create(<DealAddForm {...defaultProps} />)
      .toJSON();

    expect(rendered).toMatchSnapshot();
  });
});
