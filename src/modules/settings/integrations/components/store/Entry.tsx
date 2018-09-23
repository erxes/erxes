import { Icon, ModalTrigger, Tip } from 'modules/common/components';
import { __ } from 'modules/common/utils';
import Facebook from 'modules/settings/integrations/containers/facebook/Form';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { Box, IntegrationItem } from './styles';

type Props= {
  integration: any;
  getClassName: (selectedKind: string) => string;
  toggleBox: (kind: string) => void;
  totalCount: number;
};

class Entry extends React.Component<Props> {
  getCount(kind) {
    const { totalCount } = this.props;
    const countByKind = totalCount[kind];

    if (!countByKind) {
      return null;
    }

    return <span>({countByKind})</span>;
  }

  renderCreate(createUrl, createModal) {
    if (!createUrl && !createModal) {
      return null;
    }

    if (createModal === 'facebook') {
      const trigger = <a>+ {__('Add')}</a>;

      return (
        <ModalTrigger 
          title="Add facebook page" 
          trigger={trigger}
          content={(props) => <Facebook {...props} />}
        />
      );
    }

    return <Link to={createUrl}>+ {__('Add')}</Link>;
  }

  renderType(inMessenger) {
    if (!inMessenger) {
      return null;
    }

    return (
      <Tip text="Works in messenger">
        <Icon icon="chat" />
      </Tip>
    );
  }

  render() {
    const { integration, getClassName, toggleBox } = this.props;

    return (
      <IntegrationItem
        key={integration.name}
        className={getClassName(integration.kind)}
      >
        <Box onClick={() => toggleBox(integration.kind)}>
          <img alt="logo" src={integration.logo} />
          <h5>
            {integration.name} {this.getCount(integration.kind)}{' '}
            {this.renderType(integration.isMessenger)}
          </h5>
          <p>{integration.description}</p>
        </Box>
        {this.renderCreate(integration.createUrl, integration.createModal)}
      </IntegrationItem>
    );
  }
}

export default Entry;
