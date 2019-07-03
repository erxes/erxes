import * as React from "react";
import { __ } from "../../utils";
import { ConversationList, LeadConnect } from "../containers";
import { IntegrationItem } from "./";

type Props = {
  formCode: string;
  brandCode: string;
  hideConversations: boolean;
};

export default class Integrations extends React.PureComponent<Props> {
  renderLead() {
    if (!this.props.formCode) {
      return null;
    }

    const { brandCode, formCode } = this.props;

    return (
      <IntegrationItem>
        <LeadConnect brandCode={brandCode} formCode={formCode} />
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
      </>
    );
  }
}
