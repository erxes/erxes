import * as React from "react";

import { __, checkRules, requestBrowserInfo } from "../../../utils";

import Card from "../../components/Card.tsx";
import IntegrationItem from "../../components/IntegrationItem";
import LeadContent from "./LeadContent";
import client from "../../../apollo-client";
import { connection } from "../../connection";
import { formConnectMutation } from "../../../form/graphql";
import gql from "graphql-tag";

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
      source: "fromMessenger",
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
          throw new Error("Integration not found");
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
      return <h4>{__("Failed")}</h4>;
    }

    if (this.state.loading) {
      return <div className="loader" />;
    }

    if (!this.state.browserInfo) {
      return null;
    }

    const leadData = connection.leadData[this.props.formCode];

    const { form } = leadData;

    // check rules ======
    const isPassedAllRules = checkRules(
      form?.leadData.rules || [],
      this.state.browserInfo
    );

    if (!isPassedAllRules) {
      return null;
    }

    return (
      <Card p="0">
        <IntegrationItem>
          <LeadContent form={form} formCode={this.props.formCode} />
        </IntegrationItem>
      </Card>
    );
  }
}

export default LeadConnect;
