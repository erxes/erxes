import * as React from 'react';
import { __ } from '../../utils';
import { ConversationList, LeadConnect, WebsiteApp } from '../containers';
import { IWebsiteApp } from '../types';
import { IntegrationItem } from './';

type Props = {
  formCode: string;
  brandCode: string;
  websiteApps?: IWebsiteApp[];
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

  renderWebsiteApps() {
    const { websiteApps } = this.props;

    if (!websiteApps) {
      return null;
    }

    return websiteApps.map((websiteApp, index) => {
      return (
        <IntegrationItem key={index}>
          <WebsiteApp websiteApp={websiteApp} />
        </IntegrationItem>
      );
    });
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
        {this.renderWebsiteApps()}
      </>
    );
  }
}
