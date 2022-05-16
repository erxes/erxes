import { Alert, Chooser, Spinner, withProps } from '@erxes/ui/src';
import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import React from 'react';
import { graphql } from 'react-apollo';
import { mutations, queries } from '../../graphql';
import CustomerForm from '@erxes/ui/src/customers/containers/CustomerForm';
import {
  CustomersQueryResponse,
  ICustomer
} from '@erxes/ui/src/customers/types';
import {
  IParticipant,
  AddParticipantsMutation,
  ParticipantsQueryResponse,
  RemoveParticipantsMutation
} from '../../types';
import { renderFullName } from '@erxes/ui/src/utils/core';
import { queries as customerQueries } from '@erxes/ui/src/customers/graphql';

type Props = {
  search: (value: string, loadMore?: boolean) => void;
  perPage: number;
  searchValue: string;
  closeModal: () => void;
  dealId: string;
  participants: IParticipant[];
  onSelect: (datas: ICustomer[]) => void;
};

type FinalProps = {
  participantsQuery: ParticipantsQueryResponse;
  customersQuery: CustomersQueryResponse;
  addParticipantsMutation: AddParticipantsMutation;
  removeParticipantsMutation: RemoveParticipantsMutation;
} & Props;

class ParticipantChooser extends React.Component<
  WrapperProps & FinalProps,
  { newCustomer?: ICustomer }
> {
  constructor(props) {
    super(props);

    this.state = {
      newCustomer: undefined
    };
  }

  resetAssociatedItem = () => {
    return this.setState({ newCustomer: undefined });
  };

  render() {
    const {
      participantsQuery,
      customersQuery,
      participants,
      dealId,
      search,
      onSelect,
      addParticipantsMutation,
      removeParticipantsMutation
    } = this.props;

    const onSelected = customers => {
      const prevCustomersIds = participants.map(e => e.customer._id) || [];
      const removedIds = prevCustomersIds.filter(
        a => !customers.map(e => e._id).includes(a)
      );

      if (removedIds.length) {
        removeParticipantsMutation({
          variables: {
            dealId,
            customerIds: removedIds
          }
        })
          .then(() => {
            if (onSelect) {
              onSelect(customers);
            }
          })
          .catch(error => {
            Alert.error(error.message);
          });
      }

      if (customers.length) {
        addParticipantsMutation({
          variables: {
            dealId: this.props.dealId,
            customerIds: customers.map(c => c._id)
          }
        })
          .then(() => {
            if (onSelect) {
              onSelect(customers);
            }
          })
          .catch(error => {
            Alert.error(error.message);
          });
      }
    };

    const renderName = customer => {
      return renderFullName(customer);
    };

    if (participantsQuery.loading || customersQuery.loading) {
      return <Spinner />;
    }

    const customers = customersQuery.customers || [];

    const updatedProps = {
      ...this.props,
      data: {
        name: 'Deal',
        datas: participants.map(e => e.customer) || []
      },
      search,
      clearState: () => search(''),
      title: 'participants',
      renderForm: formProps => <CustomerForm {...formProps} size="lg" />,
      renderName,
      newItem: this.state.newCustomer,
      resetAssociatedItem: this.resetAssociatedItem,
      onSelect: onSelected,
      datas: customers,
      refetchQuery: queries.participants
    };

    return <Chooser {...updatedProps} />;
  }
}

const WithQuery = withProps<Props>(
  compose(
    graphql<Props, ParticipantsQueryResponse, { dealId: string }>(
      gql(queries.participants),
      {
        name: 'participantsQuery',
        options: props => {
          return {
            variables: {
              dealId: props.dealId
            },
            fetchPolicy: 'network-only'
          };
        }
      }
    ),

    graphql<
      Props & WrapperProps,
      CustomersQueryResponse,
      { searchValue: string; perPage: number }
    >(gql(customerQueries.customers), {
      name: 'customersQuery',
      options: props => {
        return {
          variables: {
            searchValue: props.searchValue,
            perPage: props.perPage
          },
          fetchPolicy: 'network-only'
        };
      }
    }),

    // mutations
    graphql<{}, AddParticipantsMutation, IParticipant>(
      gql(mutations.addParticipants),
      {
        name: 'addParticipantsMutation'
      }
    ),

    graphql<{}, RemoveParticipantsMutation>(
      gql(mutations.removeParticipantsFromDeal),
      {
        name: 'removeParticipantsMutation'
      }
    )
  )(ParticipantChooser)
);

type WrapperProps = {
  dealId: string;
  participants: IParticipant[];
  onSelect: (datas: ICustomer[]) => void;
  closeModal: () => void;
};

export default class Wrapper extends React.Component<
  WrapperProps,
  {
    perPage: number;
    searchValue: string;
  }
> {
  constructor(props) {
    super(props);
    this.state = { perPage: 20, searchValue: '' };
  }

  search = (value, loadmore) => {
    let perPage = 20;

    if (loadmore) {
      perPage = this.state.perPage + 20;
    }

    return this.setState({ perPage, searchValue: value });
  };

  render() {
    const { searchValue, perPage } = this.state;

    return (
      <WithQuery
        {...this.props}
        search={this.search}
        perPage={perPage}
        searchValue={searchValue}
      />
    );
  }
}
