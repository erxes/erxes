import * as React from 'react';
import { __ } from '../../utils';
import { ConversationInit, ConversationList, LeadConnect, WebsiteApp } from '../containers';
import { IWebsiteApp } from '../types';
import { IntegrationItem } from './';

type Props = {
  formCodes: string[];
  brandCode: string;
  websiteApps?: IWebsiteApp[];
  hideConversations: boolean;
};

export default class Integrations extends React.PureComponent<Props> {
  renderLead() {
    const { brandCode, formCodes } = this.props;

    if (!formCodes || formCodes.length === 0) {
      return null;
    }

    return formCodes.map((formCode: string) => (
      <IntegrationItem key={formCode}>
        <LeadConnect brandCode={brandCode} formCode={formCode} />
      </IntegrationItem>
    ));
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

  renderConversationInit() {
    if (this.props.hideConversations) {
      return null;
    }

    return (
      <IntegrationItem title="Recent conversations">
        <ConversationInit />
      </IntegrationItem>
    );
  }

  render() {
    return (
      <>
        {this.renderConversationInit()}
        {this.renderLead()}
        {this.renderWebsiteApps()}
      </>
    );
  }
}
