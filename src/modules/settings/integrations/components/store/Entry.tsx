import { Icon, ModalTrigger } from 'modules/common/components';
import { __ } from 'modules/common/utils';
import Facebook from 'modules/settings/integrations/containers/facebook/Form';
import Gmail from 'modules/settings/integrations/containers/google/Gmail';
import * as React from 'react';
import { Link } from 'react-router-dom';
import KnowledgeBase from '../../containers/knowledgebase/Form';
import Lead from '../../containers/lead/Form';
import Twitter from '../../containers/twitter/Form';
import { Box, IntegrationItem, Type } from './styles';

type Props = {
  integration: any;
  getClassName: (selectedKind: string) => string;
  toggleBox: (kind: string) => void;
  totalCount: {
    messenger: number;
    form: number;
    twitter: number;
    facebook: number;
    gmail: number;
  };
  messengerAppsCount: number;
};

class Entry extends React.Component<Props> {
  getCount = kind => {
    const { totalCount, messengerAppsCount } = this.props;
    let countByKind = totalCount[kind];

    if (kind === 'knowledgebase') {
      countByKind = messengerAppsCount;
    }

    if (!countByKind) {
      return null;
    }

    return <span>({countByKind})</span>;
  };

  renderCreate(createUrl, createModal) {
    if (!createUrl && !createModal) {
      return null;
    }

    if (createModal === 'facebook') {
      const trigger = <a>+ {__('Add')}</a>;

      const content = props => <Facebook {...props} />;

      return (
        <ModalTrigger
          title="Add facebook page"
          trigger={trigger}
          content={content}
        />
      );
    }

    if (createModal === 'lead') {
      const trigger = <a>+ {__('Add')}</a>;

      const content = props => <Lead {...props} />;

      return (
        <ModalTrigger title="Add lead" trigger={trigger} content={content} />
      );
    }

    if (createModal === 'knowledgeBase') {
      const trigger = <a>+ {__('Add')}</a>;

      const content = props => <KnowledgeBase {...props} />;

      return (
        <ModalTrigger
          title="Add knowledgeBase"
          trigger={trigger}
          content={content}
        />
      );
    }

    if (createModal === 'twitter') {
      const trigger = <a>+ {__('Add')}</a>;

      const content = props => <Twitter {...props} />;

      return (
        <ModalTrigger
          title="Add Twitter profile"
          trigger={trigger}
          content={content}
        />
      );
    }

    if (createModal === 'gmail') {
      const trigger = <a>+ {__('Add')}</a>;

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

  BoxOnClick = () => {
    return this.props.toggleBox(this.props.integration.kind);
  };

  render() {
    const { integration, getClassName } = this.props;

    return (
      <IntegrationItem
        key={integration.name}
        className={getClassName(integration.kind)}
      >
        <Box onClick={this.BoxOnClick} isInMessenger={integration.inMessenger}>
          <img alt="logo" src={integration.logo} />
          <h5>
            {integration.name} {this.getCount(integration.kind)}{' '}
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
