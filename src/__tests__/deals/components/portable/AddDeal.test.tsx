import { mount, shallow } from 'enzyme';
import DealAddForm from 'modules/deals/components/portable/AddDeal';
import { IDealParams } from 'modules/deals/types';
import * as React from 'react';
import * as renderer from 'react-test-renderer';

describe('DealAddForm component', () => {
  const defaultProps = {
    saveDeal: (doc: IDealParams, callback: () => void) => null,
    closeModal: () => null
  };

  test('renders shallowsuccessfully', () => {
    shallow(<DealAddForm {...defaultProps} />);
  });

  test('renders mount with default props', () => {
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
