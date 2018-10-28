import * as React from "react";
import { __ } from "../../utils";
import { ConversationList, LeadConnect } from "../containers";
import { IntegrationItem } from "./";

type Props = {
  formId: string;
  brandId: string;
};

export default class Integrations extends React.PureComponent<Props> {
  renderLead() {
    if (!this.props.formId) {
      return null;
    }

    const { brandId, formId } = this.props;
    return (
      <IntegrationItem>
        <LeadConnect brandCode={brandId} formCode={formId} />
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
