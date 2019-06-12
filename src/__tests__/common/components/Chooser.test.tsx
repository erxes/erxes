import { mount, shallow } from 'enzyme';
import * as React from 'react';

import * as renderer from 'react-test-renderer';
import Chooser from '../../../modules/common/components/Chooser';

describe('Chooser component', () => {
  const defaultProps = {
    data: 'today',
    onSelect: (datas: any[]) => null,
    search: (value: string, reload?: boolean) => null,
    datas: ['datas'],
    title: 'title',
    renderName: (data: any) => null,
    renderForm: (props: { closeModal: () => void }) => 'any',
    perPage: 0,
    clearState: () => null,
    closeModal: () => null
  };

  test('renders Chooser successfully', () => {
    shallow(<Chooser {...defaultProps} />);
  });

  test('snapshot matches', () => {
    const rendered = renderer.create(<Chooser {...defaultProps} />).toJSON();

    expect(rendered).toMatchSnapshot();
  });

  test('renders successfully with default value', () => {
    const wrapper = mount(<Chooser {...defaultProps} />);
    const props = wrapper.props();

    expect(props).toMatchObject(defaultProps);
  });
});
