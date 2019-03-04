import * as React from "react";
import { __ } from "../../utils";
import { ConversationList, LeadConnect } from "../containers";
import { IntegrationItem } from "./";

type Props = {
  formCode: string;
  brandCode: string;
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
  render() {
    return (
      <>
        <IntegrationItem title="Recent conversations">
          <ConversationList />
        </IntegrationItem>
        {this.renderLead()}
      </>
    );
  }
}
