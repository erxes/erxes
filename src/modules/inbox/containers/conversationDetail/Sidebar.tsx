import client from 'apolloClient';
import gql from 'graphql-tag';
import { Sidebar as DumbSidebar } from 'modules/inbox/components/conversationDetail';
import { queries } from 'modules/inbox/graphql';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { ICustomer } from '../../../customers/types';
import { IConversation } from '../../types';

type Props = {
  conversation: IConversation;
  customerDetailQuery: any;
};

type State = {
  customer: ICustomer;
  loading: boolean;
};

const STORAGE_KEY = `erxes_sidebar_section_config`;

const getConfig = () => {
  const sidebarConfig = localStorage.getItem(STORAGE_KEY);

  if (sidebarConfig) {
    return JSON.parse(sidebarConfig);
  }
};

const setConfig = params => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(params));
};

class Sidebar extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = { customer: {} as ICustomer, loading: false };
    this.toggleSection = this.toggleSection.bind(this);
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

    const sectionParams = getConfig();

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
        console.log(error.message); // eslint-disable-line
      });

    return;
  }

  toggleSection({ name, isOpen }: { name: string; isOpen: boolean }) {
    const customerId = this.props.conversation.customerId;
    const config = getConfig();

    config[name] = isOpen;

    setConfig(config);

    this.getCustomerDetail(customerId);
  }

  render() {
    const { customer, loading } = this.state;

    if (!localStorage.getItem(STORAGE_KEY)) {
      setConfig({
        showProfile: true,
        showCompanies: false,
        showConversationDetails: false,
        showCustomFields: false,
        showDeals: false,
        showDeviceProperties: false,
        showMessengerData: false,
        showTags: false
      });
    }

    const taggerRefetchQueries = [
      {
        query: gql(queries.generateCustomerDetailQuery(getConfig())),
        variables: { _id: customer._id }
      }
    ];

    const updatedProps = {
      ...this.props,
      customer,
      loading,
      toggleSection: this.toggleSection,
      config: getConfig(),
      taggerRefetchQueries
    };

    return <DumbSidebar {...updatedProps} />;
  }
}

export default compose(
  graphql(gql(queries.generateCustomerDetailQuery(getConfig())), {
    name: 'customerDetailQuery',
    options: ({ conversation }: { conversation: IConversation }) => ({
      variables: {
        _id: conversation.customerId
      }
    })
  })
)(Sidebar);
