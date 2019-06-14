import { mount, shallow } from 'enzyme';
import * as React from 'react';
import * as renderer from 'react-test-renderer';

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

  test('renders shallow successfully', () => {
    shallow(<CompanyForm {...defaultProps} />);
  });

  test('renders with default props', () => {
    const control = mount(<CompanyForm {...defaultProps} />);
    const props = control.props();

    expect(props).toMatchObject(defaultProps);
  });

  test('renders mount test 2 different props', () => {
    const rendered = mount(<CompanyForm {...defaultProps} />);
    const props = rendered.props();

    expect(defaultProps).toMatchObject(props);
  });

  test('render expect Modifiliable', () => {
    const rendered = mount(<CompanyForm {...defaultProps} />);
    const found = rendered.find('span').debug();
    const founded = found.search('className="Select-placeholder"');
    expect(founded).toBeGreaterThan(-1);
  });

  test('snapshot matches', () => {
    const rendered = renderer
      .create(<CompanyForm {...defaultProps} />)
      .toJSON();

    expect(rendered).toMatchSnapshot();
  });
});
