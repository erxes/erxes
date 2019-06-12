import { mount, shallow } from 'enzyme';
import FullPreviewStep from 'modules/forms/components/step/FullPreviewStep';
import * as React from 'react';
import * as renderer from 'react-test-renderer';

describe('FullPreviewStep component', () => {
  const defaultProps = {
    type: 'string',
    color: 'red',
    theme: 'default',
    onChange: (name: 'carousel', value: string) => null,
    carousel: 'carousel'
  };

  test('renders shallow successfully', () => {
    shallow(<FullPreviewStep {...defaultProps} />);
  });

  test('renders mount with default props', () => {
    const control = mount(<FullPreviewStep {...defaultProps} />);
    const props = control.props();

    expect(props).toMatchObject(defaultProps);
  });

  test('snapshot matches', () => {
    const rendered = renderer
      .create(<FullPreviewStep {...defaultProps} />)
      .toJSON();

    expect(rendered).toMatchSnapshot();
  });
});
