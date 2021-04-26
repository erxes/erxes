import { shallow } from 'enzyme';
import React from 'react';

import { IButtonMutateProps } from 'modules/common/types';
import Form from '../../modules/tags/components/Form';

describe('Form component', () => {
  const defaultProps = {
    type: 'typ',
    save: (params: {
      doc: {
        _id?: string;
        name: string;
        type: string;
        colorCode: string;
      };
      callback: () => void;
    }) => null,
    afterSave: () => null,
    renderButton: (props: IButtonMutateProps) => <div />
  };

  test('renders Form successfully', () => {
    const wrapper = shallow(<Form tags={[]} {...defaultProps} />);
    expect(wrapper).not.toBe('');
  });
});
