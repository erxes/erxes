import { shallow } from 'enzyme';
import React from 'react';

import { IButtonMutateProps } from 'modules/common/types';
import Row from '../../modules/tags/components/Row';

describe('Row component', () => {
  const defaultProps = {
    tag: {
      _id: 'id',
      name: 'name',
      type: 'typ',
      colorCode: 'red'
    },
    type: 'type',
    remove: (tag: {
      _id: string;
      type: string;
      name: string;
      colorCode: string;
    }) => null,
    save: (params: {
      doc: {
        _id?: string;
        name: string;
        type: string;
        colorCode: string;
      };
      callback: () => void;
    }) => null,
    renderButton: (props: IButtonMutateProps) => <div />
  };

  test('renders WithPermission successfully', () => {
    const wrapper = shallow(<Row tags={[]} space={0} {...defaultProps} />);
    expect(wrapper).not.toBe('');
  });
});
