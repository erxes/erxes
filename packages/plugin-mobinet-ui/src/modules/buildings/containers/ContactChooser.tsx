import { queries as companyQueries } from '@erxes/ui-contacts/src/companies/graphql';
import { queries as customerQueries } from '@erxes/ui-contacts/src/customers/graphql';
import { Chooser, renderFullName, Spinner } from '@erxes/ui/src';
import { gql, useQuery } from '@apollo/client';
import React from 'react';
import { renderCompanyName } from '../../../utils';
import { mutations } from '../graphql';
import { IBuilding } from '../types';

// import AssetForm from '../../asset/containers/Form';

type Props = {
  building: IBuilding;
  closeModal: () => void;
  contacts: any[];
  contactType?: string;
  onSelect: (datas: any) => void;
};

const ContactChooser = (props: Props) => {
  const { contactType = 'customers', onSelect } = props;
  const contactsQry =
    contactType === 'customers'
      ? gql(customerQueries.customers)
      : gql(companyQueries.companies);

  const qry = useQuery(contactsQry, {
    variables: {
      perPage: 20,
      page: 1,
      searchValue: ''
    }
  });

  const { loading, refetch, fetchMore, variables, data } = qry;

  if (loading) {
    return <Spinner />;
  }

  const search = (value: string, reload?: boolean) => {
    console.log('search', value);
    console.log('reload', reload);
  };

  const { customers, companies } = data;

  const contacts = contactType === 'customers' ? customers : companies;

  const extendedProps = {
    ...props,
    refetch,
    fetchMore,
    title: contactType,
    datas: contacts,
    data: { name: 'Building', datas: props.contacts },
    perPage: 10,
    limit: 10,
    search,
    onSelect,
    clearState: () => {
      console.log('clearState');
    },
    renderForm: (props: any) => {
      console.log('renderForm', props);
      return <div>renderForm</div>;
    },
    renderName: (contact: any) => {
      if (contactType === 'customers') {
        return renderFullName(contact);
      }
      return renderCompanyName(contact);
    }
  };

  return <Chooser {...extendedProps} />;
};

export default ContactChooser;
