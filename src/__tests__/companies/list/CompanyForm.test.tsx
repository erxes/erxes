import { mount, shallow } from 'enzyme';
import React from 'react';

import CompanyForm from '../../../modules/companies/components/list/CompanyForm';
import { ICompany, ICompanyDoc } from '../../../modules/companies/types';

describe('CompanyForm component', () => {
  const parentCompany = {} as ICompany;

  const company = {
    _id: 'string',
    owner: {
      _id: '_id',
      username: 'email',
      email: 'username'
    },
    parentCompany,
    getTags: [
      {
        _id: 'id',
        type: 'default',
        name: 'tag',
        colorCode: 'red'
      }
    ],
    customers: [],
    links: false
  } as ICompany;

  const defaultProps = {
    action: (params: { doc: ICompanyDoc }) => null,
    company,
    closeModal: () => null
  };

  // test('renders shallow successfully', () => {
  //   shallow(<CompanyForm {...defaultProps} />);
  // });

  // test('renders with default props', () => {
  //   const control = mount(<CompanyForm {...defaultProps} />);
  //   const props = control.props();

  //   expect(props).toMatchObject(defaultProps);
  // });
});
