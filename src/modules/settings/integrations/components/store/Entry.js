import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { ModalTrigger, Tip, Icon } from 'modules/common/components';
import Facebook from 'modules/settings/integrations/containers/facebook/Form';
import { IntegrationItem, Box } from './styles';

const propTypes = {
  integration: PropTypes.object,
  getClassName: PropTypes.func,
  toggleBox: PropTypes.func,
  totalCount: PropTypes.object
};

class Entry extends Component {
  getCount(kind) {
    const { totalCount } = this.props;
    const countByKind = totalCount[kind];

    if (!countByKind) {
      return null;
    }

    return <span>({countByKind})</span>;
  }

  renderCreate(createUrl, createModal) {
    const { __ } = this.context;

    if (!createUrl && !createModal) {
      return null;
    }

    if (createModal === 'facebook') {
      const trigger = <a>+ {__('Add')}</a>;

      return (
        <ModalTrigger title="Add facebook page" trigger={trigger}>
          <Facebook />
        </ModalTrigger>
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
            {this.renderType(integration.inMessenger)}
          </h5>
          <p>{integration.description}</p>
        </Box>
        {this.renderCreate(integration.createUrl, integration.createModal)}
      </IntegrationItem>
    );
  }
}

Entry.propTypes = propTypes;
Entry.contextTypes = {
  __: PropTypes.func
};

export default Entry;
