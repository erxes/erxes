import Icon from 'modules/common/components/Icon';
import ModalTrigger from 'modules/common/components/ModalTrigger';
import { __ } from 'modules/common/utils';
import Facebook from 'modules/settings/integrations/containers/facebook/Form';
import Gmail from 'modules/settings/integrations/containers/google/Gmail';
import React from 'react';
import { Link } from 'react-router-dom';
import KnowledgeBase from '../../containers/knowledgebase/Form';
import Lead from '../../containers/lead/Form';
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

    if (createModal === 'facebook') {
      const trigger = <a href="#add">+ {__('Add')}</a>;

      const content = props => <Facebook {...props} />;

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

    if (createModal === 'gmail') {
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
        {this.renderCreate(integration.createUrl, integration.createModal)}
      </IntegrationItem>
    );
  }
}

export default Entry;
