import { shallow } from 'enzyme';
import React from 'react';

import { IButtonMutateProps } from '../../modules/common/types';
import BrandAdd from '../../modules/onboard/components/BrandAdd';

describe('BrandAdd component', () => {
  const defaultProps = {
    brandsTotalCount: 0,
    changeStep: () => null,
    renderButton: (props: IButtonMutateProps) => <div />
  };

  test('renders BrandAdd successfully', () => {
    const wrapper = shallow(<BrandAdd {...defaultProps} />);
    expect(wrapper).not.toBe('');
  });
});
