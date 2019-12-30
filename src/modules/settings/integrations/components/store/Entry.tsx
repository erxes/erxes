import Icon from 'modules/common/components/Icon';
import ModalTrigger from 'modules/common/components/ModalTrigger';
import { __ } from 'modules/common/utils';
import CallPro from 'modules/settings/integrations/containers/callpro/Form';
import Gmail from 'modules/settings/integrations/containers/gmail/Form';
import NylasForm from 'modules/settings/integrations/containers/mail/Form';
import React from 'react';
import { Link } from 'react-router-dom';
import { KIND_CHOICES } from '../../constants';
import Chatfuel from '../../containers/chatfuel/Form';
import Settings from '../../containers/engages/Settings';
import Facebook from '../../containers/facebook/Form';
import KnowledgeBase from '../../containers/knowledgebase/Form';
import Lead from '../../containers/lead/Form';
import Twitter from '../../containers/twitter/Twitter';
import Website from '../../containers/website/Form';
import { Box, IntegrationItem, Type } from './styles';

type Props = {
  integration: any;
  getClassName: (selectedKind: string) => string;
  toggleBox: (kind: string) => void;
  messengerAppsCount?: number;
  queryParams: any;
  totalCount: {
    messenger: number;
    form: number;
    facebook: number;
    callpro: number;
    chatfuel: number;
    gmail: number;
    imap: number;
    office365: number;
    outlook: number;
    yahoo: number;
  };
};

class Entry extends React.Component<Props> {
  getCount = kind => {
    const { totalCount, messengerAppsCount } = this.props;
    const countByKind = totalCount[kind];

    if (typeof messengerAppsCount === 'number') {
      return <span>({messengerAppsCount})</span>;
    }

    if (typeof countByKind === 'undefined') {
      return null;
    }

    return <span>({countByKind})</span>;
  };

  renderCreate(createUrl, createModal) {
    if (!createUrl && !createModal) {
      return null;
    }

    if (createModal === KIND_CHOICES.FACEBOOK_MESSENGER) {
      const trigger = <a href="#add">+ {__('Add')}</a>;

      const content = props => (
        <Facebook kind={KIND_CHOICES.FACEBOOK_MESSENGER} {...props} />
      );

      return (
        <ModalTrigger
          title="Add facebook page"
          autoOpenKey="showFacebookMessengerModal"
          trigger={trigger}
          content={content}
        />
      );
    }

    if (createModal === KIND_CHOICES.FACEBOOK_POST) {
      const trigger = <a href="#add">+ {__('Add')}</a>;

      const content = props => (
        <Facebook kind={KIND_CHOICES.FACEBOOK_POST} {...props} />
      );

      return (
        <ModalTrigger
          title="Add facebook page"
          trigger={trigger}
          content={content}
        />
      );
    }

    if (!createUrl && !createModal) {
      return null;
    }

    if (createModal === 'lead') {
      const trigger = <a href="#add">+ {__('Add')}</a>;

      const content = props => <Lead {...props} />;

      return (
        <ModalTrigger title="Add Pop Ups" trigger={trigger} content={content} />
      );
    }

    if (createModal === 'sesconfig') {
      const trigger = (
        <a href="#add">
          <Icon icon="link-1" /> {__('Manage')}
        </a>
      );

      const content = props => <Settings {...props} />;

      return (
        <ModalTrigger
          title="Manage engage config"
          size="lg"
          trigger={trigger}
          content={content}
        />
      );
    }

    if (createModal === 'knowledgeBase') {
      const trigger = <a href="#add">+ {__('Add')}</a>;

      const content = props => <KnowledgeBase {...props} />;

      return (
        <ModalTrigger
          title="Add knowledge base"
          trigger={trigger}
          content={content}
        />
      );
    }

    if (createModal === 'website') {
      const trigger = <a href="#add">+ {__('Add')}</a>;

      const content = props => <Website {...props} />;

      return (
        <ModalTrigger title="Add website" trigger={trigger} content={content} />
      );
    }

    if (createModal === 'callpro') {
      const trigger = <a href="#add">+ {'Add'}</a>;

      const content = props => <CallPro {...props} />;

      return (
        <ModalTrigger
          title="Add call pro"
          trigger={trigger}
          content={content}
        />
      );
    }

    if (createModal === 'chatfuel') {
      const trigger = <a href="#add">+ {'Add'}</a>;

      const content = props => <Chatfuel {...props} />;

      return (
        <ModalTrigger
          title="Add chatfuel"
          trigger={trigger}
          content={content}
        />
      );
    }

    if (createModal === KIND_CHOICES.NYLAS_OFFICE365) {
      const trigger = <a href="#add">+ {__('Add')}</a>;

      const content = props => <NylasForm kind={createModal} {...props} />;

      return (
        <ModalTrigger
          title="Add Office 365"
          trigger={trigger}
          content={content}
        />
      );
    }

    if (createModal === KIND_CHOICES.NYLAS_IMAP) {
      const trigger = <a href="#add">+ {__('Add')}</a>;

      const content = props => <NylasForm kind={createModal} {...props} />;

      return (
        <ModalTrigger title="Add IMAP" trigger={trigger} content={content} />
      );
    }

    if (createModal === KIND_CHOICES.NYLAS_GMAIL) {
      const trigger = <a href="#add">+ {__('Add')}</a>;

      const content = props => <NylasForm kind={createModal} {...props} />;

      return (
        <ModalTrigger title="Add gmail" trigger={trigger} content={content} />
      );
    }

    if (createModal === KIND_CHOICES.NYLAS_OUTLOOK) {
      const trigger = <a href="#add">+ {__('Add')}</a>;

      const content = props => <NylasForm kind={createModal} {...props} />;

      return (
        <ModalTrigger title="Add Outlook" trigger={trigger} content={content} />
      );
    }

    if (createModal === KIND_CHOICES.NYLAS_YAHOO) {
      const trigger = <a href="#add">+ {__('Add')}</a>;

      const content = props => <NylasForm kind={createModal} {...props} />;

      return (
        <ModalTrigger title="Add Yahoo" trigger={trigger} content={content} />
      );
    }

    if (createModal === KIND_CHOICES.GMAIL) {
      const trigger = <a href="#add">+ {__('Add')}</a>;

      const content = props => <Gmail {...props} />;

      return (
        <ModalTrigger title="Add gmail" trigger={trigger} content={content} />
      );
    }

    if (createModal === 'twitter') {
      const trigger = <a href="#add">+ {__('Add')}</a>;

      const content = props => <Twitter {...props} />;

      return (
        <ModalTrigger title="Add twitter" trigger={trigger} content={content} />
      );
    }

    return <Link to={createUrl}>+ {__('Add')}</Link>;
  }

  renderType = type => {
    if (!type) {
      return null;
    }

    return (
      <Type>
        <Icon icon="chat" /> {__('Works with messenger')}
      </Type>
    );
  };

  boxOnClick = () => {
    return this.props.toggleBox(this.props.integration.kind);
  };

  render() {
    const { integration, getClassName } = this.props;
    const { createUrl, createModal } = integration;

    return (
      <IntegrationItem
        key={integration.name}
        className={getClassName(integration.kind)}
      >
        <Box onClick={this.boxOnClick} isInMessenger={integration.inMessenger}>
          <img alt="logo" src={integration.logo} />
          <h5>
            {integration.name} {this.getCount(integration.kind)}
          </h5>
          <p>
            {integration.description}
            {this.renderType(integration.inMessenger)}
          </p>
        </Box>
        {this.renderCreate(createUrl, createModal)}
      </IntegrationItem>
    );
  }
}

export default Entry;
