// test passed
import { mount, shallow } from 'enzyme';
import { IBreadCrumbItem } from 'modules/common/types';
import FormBase from 'modules/engage/components/FormBase';
import { IEngageMessageDoc } from 'modules/engage/types';
import * as React from 'react';

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
    shallow(<FormBase {...defaultProps} />);
  });

  test('renders with default props', () => {
    const control = mount(<FormBase {...defaultProps} />);
    const props = control.props();

    expect(props).toMatchObject(defaultProps);
  });
});
