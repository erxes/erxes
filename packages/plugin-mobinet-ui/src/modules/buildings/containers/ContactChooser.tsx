import { queries as companyQueries } from '@erxes/ui-contacts/src/companies/graphql';
import { queries as customerQueries } from '@erxes/ui-contacts/src/customers/graphql';
import { Chooser, renderFullName, Spinner } from '@erxes/ui/src';
import gql from 'graphql-tag';
import React from 'react';
import { useQuery } from 'react-apollo';

// import AssetForm from '../../asset/containers/Form';

type Props = { 
    closeModal: () => void;
    contacts: any[];
    contactType?: string;
}

const ContactChooser = (props: Props) => {
    const { contactType = 'customer' } = props;
    const contactsQry = contactType === 'customer' ? gql(customerQueries.customers) : gql(companyQueries.companies);

    console.log('contactType', contactType);

    const qry  = useQuery(contactsQry, {
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
    }

    const { customers, companies } = data;

    const contacts = contactType === 'customer' ? customers : companies;

    const extendedProps = {
        ...props,
        refetch,
        fetchMore,
        title: contactType,
        datas: contacts,
        data:{name: 'Building', datas: props.contacts},
        perPage: 10,
        limit: 10,
        search,
        onSelect: (contact: any) => {
            console.log('contact', contact);
        },
        clearState: () => {
            console.log('clearState');
        },
        renderForm: (props: any) => {
            console.log('renderForm', props);
            return <div>renderForm</div>;
        },
        renderName: (contact: any) => {
           return renderFullName(contact);
        },
    };

    return <Chooser {...extendedProps} />;

}

export default ContactChooser;