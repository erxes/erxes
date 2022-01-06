import gql from "graphql-tag";
import * as React from "react";
import client from "../../../apollo-client";
import { formConnectMutation } from "../../../form/graphql";
import { __, requestBrowserInfo } from "../../../utils";
import { connection } from "../../connection";
import LeadContent from "./LeadContent";

interface IState {
  loading: boolean;
  hasError: boolean;
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
      callback: browserInfo => {
        connection.browserInfo = browserInfo;
      }
    });
  }

  componentWillMount() {
    const { brandCode, formCode } = this.props;

    client
      .mutate({
        mutation: gql(formConnectMutation),
        variables: {
          brandCode,
          formCode
        }
      })
      .then(({ data = { widgetsLeadConnect: {} } }) => {
        const response = data?.widgetsLeadConnect;

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

    return <LeadContent formCode={this.props.formCode} />;
  }
}

export default LeadConnect;
