import client from 'apolloClient';
import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import withCurrentUser from 'modules/auth/containers/withCurrentUser';
import { IUser } from 'modules/auth/types';
import DumbSidebar from 'modules/inbox/components/conversationDetail/sidebar/Sidebar';
import { queries } from 'modules/inbox/graphql';
import React from 'react';
import { graphql } from 'react-apollo';
import { withProps } from '../../../common/utils';
import {
  CustomerDetailQueryResponse,
  ICustomer
} from '../../../customers/types';
import { IConversation } from '../../types';
import { getConfig } from '../../utils';

type Props = {
  conversation: IConversation;
};

type FinalProps = {
  customerDetailQuery: CustomerDetailQueryResponse;
  currentUser: IUser;
} & Props;

type State = {
  customer: ICustomer;
  loading: boolean;
};

const STORAGE_KEY = `erxes_sidebar_section_config`;

class Sidebar extends React.Component<FinalProps, State> {
  constructor(props) {
    super(props);

    this.state = { customer: {} as ICustomer, loading: false };
  }

  componentDidMount() {
    this.getCustomerDetail(this.props.conversation.customerId);
  }

  componentWillReceiveProps(nextProps) {
    const currentDetail = this.props.customerDetailQuery;
    const nextDetail = nextProps.customerDetailQuery;

    const current = currentDetail.customerDetail || {};
    const next = nextDetail.customerDetail || {};

    if (JSON.stringify(current) !== JSON.stringify(next)) {
      this.getCustomerDetail(next._id);
    }
  }

  getCustomerDetail(customerId?: string) {
    if (!customerId) {
      return null;
    }

    const sectionParams = getConfig(STORAGE_KEY);

    this.setState({ loading: true });

    client
      .query({
        query: gql(queries.generateCustomerDetailQuery(sectionParams)),
        fetchPolicy: 'network-only',
        variables: { _id: customerId }
      })
      .then(({ data }: { data: any }) => {
        if (data && data.customerDetail) {
          this.setState({ customer: data.customerDetail, loading: false });
        }
      })
      .catch(error => {
        console.log(error.message); // tslint:disable-line
      });

    return;
  }

  toggleSection = (): void => {
    const customerId = this.props.conversation.customerId;

    this.getCustomerDetail(customerId);
  };

  render() {
    const { customer, loading } = this.state;

    const taggerRefetchQueries = [
      {
        query: gql(queries.generateCustomerDetailQuery(getConfig(STORAGE_KEY))),
        variables: { _id: customer._id }
      }
    ];

    const updatedProps = {
      ...this.props,
      customer,
      loading,
      toggleSection: this.toggleSection,
      taggerRefetchQueries
    };

    return <DumbSidebar {...updatedProps} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<Props, CustomerDetailQueryResponse, { _id?: string }>(
      gql(queries.generateCustomerDetailQuery(getConfig(STORAGE_KEY))),
      {
        name: 'customerDetailQuery',
        options: ({ conversation }) => ({
          variables: {
            _id: conversation.customerId
          }
        })
      }
    )
  )(withCurrentUser(Sidebar))
);
