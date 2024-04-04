import gql from 'graphql-tag';
import * as React from 'react';
import client from '../../../apollo-client';
import { formConnectMutation } from '../../../form/graphql';
import { __, checkRules, requestBrowserInfo } from '../../../utils';
import { connection } from '../../connection';
import LeadContent from './LeadContent';
import IntegrationItem from '../../components/IntegrationItem';

interface IState {
  loading: boolean;
  hasError: boolean;
  browserInfo?: any;
}

type Props = {
  brandCode: string;
  formCode: string;
};

class LeadConnect extends React.PureComponent<Props, IState> {
  constructor(props: Props) {
    super(props);

    this.state = { loading: true, hasError: false };
  }

  saveBrowserInfo() {
    requestBrowserInfo({
      source: 'fromMessenger',
      callback: (browserInfo) => {
        connection.browserInfo = browserInfo;
        this.setState({ browserInfo });
      },
    });
  }

  componentWillMount() {
    const { brandCode, formCode } = this.props;

    client
      .mutate({
        mutation: gql(formConnectMutation),
        variables: {
          brandCode,
          formCode,
        },
      })
      .then(({ data = { widgetsLeadConnect: {} } }) => {
        if (!data) {
          this.setState({ hasError: true });
          return;
        }

        const response = data.widgetsLeadConnect;

        if (!response) {
          this.setState({ hasError: true });
          throw new Error('Integration not found');
        }

        // save connection info
        connection.leadData[formCode] = response;

        this.setState({ loading: false });

        // save borwser info
        this.saveBrowserInfo();
      })

      .catch(() => {
        this.setState({ hasError: true });
      });
  }

  render() {
    if (this.state.hasError) {
      return <h4>{__('Failed')}</h4>;
    }

    if (this.state.loading) {
      return <div className="loader" />;
    }

    if (!this.state.browserInfo) {
      return null;
    }

    const leadData = connection.leadData[this.props.formCode];

    const { integration } = leadData;

    // check rules ======
    const isPassedAllRules = checkRules(
      integration.leadData.rules || [],
      this.state.browserInfo
    );

    if (!isPassedAllRules) {
      return null;
    }

    return (
      <IntegrationItem>
        <LeadContent formCode={this.props.formCode} />;
      </IntegrationItem>
    );
  }
}

export default LeadConnect;
