import * as React from 'react';
import { __ } from '../../utils';
import ConversationInit from "../containers/ConversationInit";
import asyncComponent from '../../AsyncComponent';
import WebsiteApp from "../containers/websiteApp/WebsiteApp";
import { IWebsiteApp } from '../types';
import IntegrationItem from './IntegrationItem';

const LeadConnect = asyncComponent(() =>
  import(
    /* webpackChunkName: "MessengerLeadConnect" */ '../containers/lead/LeadConnect'
  )
);

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
        <LeadConnect key={formCode} brandCode={brandCode} formCode={formCode} />
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
