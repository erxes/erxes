import * as React from "react";
import { __ } from "../../utils";
import { ConversationList, LeadConnect, WebsiteApp } from "../containers";
import { IntegrationItem } from "./";

type Props = {
  formCode: string;
  brandCode: string;
  websiteAppData?: { [key: string]: string };
  hideConversations: boolean;
};

export default class Integrations extends React.PureComponent<Props> {
  renderLead() {
    const { brandCode, formCode } = this.props;

    if (!formCode) {
      return null;
    }

    return (
      <IntegrationItem>
        <LeadConnect brandCode={brandCode} formCode={formCode} />
      </IntegrationItem>
    );
  }

  renderWebsiteApp() {
    const { websiteAppData } = this.props;

    if (!websiteAppData) {
      return null;
    }

    return (
      <IntegrationItem>
        <WebsiteApp config={websiteAppData} />
      </IntegrationItem>
    );
  }

  renderConversations() {
    if (this.props.hideConversations) {
      return null;
    }

    return (
      <IntegrationItem title="Recent conversations">
        <ConversationList />
      </IntegrationItem>
    );
  }

  render() {
    return (
      <>
        {this.renderConversations()}
        {this.renderLead()}
        {this.renderWebsiteApp()}
      </>
    );
  }
}
