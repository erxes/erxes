import Icon from 'modules/common/components/Icon';
import ModalTrigger from 'modules/common/components/ModalTrigger';
import { __ } from 'modules/common/utils';
import CallPro from 'modules/settings/integrations/containers/callpro/Form';
import NylasGmail from 'modules/settings/integrations/containers/mail/gmail/Form';
import React from 'react';
import { Link } from 'react-router-dom';
import { KIND_CHOICES } from '../../constants';
import Settings from '../../containers/engages/Settings';
import KnowledgeBase from '../../containers/knowledgebase/Form';
import Lead from '../../containers/lead/Form';
import Facebook from '../facebook/Form';
import Gmail from '../gmail/Form';
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
    gmail: number;
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
        <ModalTrigger title="Add lead" trigger={trigger} content={content} />
      );
    }

    if (createModal === 'sesconfig') {
      const trigger = (
        <a href="#add">
          <Icon icon="settings" /> {__('Manage')}
        </a>
      );

      const content = props => <Settings {...props} />;

      return (
        <ModalTrigger
          title="Add engage config"
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

    if (KIND_CHOICES.NYLAS_GMAIL) {
      const trigger = <a href="#add">+ {__('Add')}</a>;

      const content = props => <NylasGmail {...props} />;

      return (
        <ModalTrigger title="Add gmail" trigger={trigger} content={content} />
      );
    }

    if (createModal === KIND_CHOICES.GMAIL) {
      const trigger = <a href="#add">+ {__('Add')}</a>;

      const content = props => <Gmail {...props} />;

      return (
        <ModalTrigger title="Add gmail" trigger={trigger} content={content} />
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
