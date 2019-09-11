import { shallow } from 'enzyme';
import { IBreadCrumbItem } from 'modules/common/types';
import FormBase from 'modules/engage/components/FormBase';
import { IEngageMessageDoc } from 'modules/engage/types';
import React from 'react';

describe('FormBase component', () => {
  const defaultProps = {
    kind: 'string',
    content: (params: {
      renderTitle: () => string;
      breadcrumbs: IBreadCrumbItem[];
      validateDoc: (
        type: string,
        doc: IEngageMessageDoc
      ) => { status: string; doc?: IEngageMessageDoc };
    }) => 'any'
  };

  test('renders successfully', () => {
    const wrapper = shallow(<FormBase {...defaultProps} />);
    expect(wrapper).not.toBe('');
  });
});
