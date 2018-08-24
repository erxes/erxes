import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { ModalTrigger, Tip, Icon } from 'modules/common/components';
import { Facebook } from '../../containers';
import { IntegrationItem, Box } from './styles';

const propTypes = {
  integration: PropTypes.object,
  getClassName: PropTypes.func,
  toggleBox: PropTypes.func,
  totalCount: PropTypes.object
};

class IntegrationEntry extends Component {
  getCount(kind) {
    const { totalCount } = this.props;
    const countByKind = totalCount[kind];

    if (countByKind) {
      return <span>({countByKind})</span>;
    }

    return null;
  }

  renderCreate(createUrl, createModal) {
    const { __ } = this.context;

    if (createUrl) {
      return <Link to={createUrl}>+ {__('Add')}</Link>;
    }

    if (createModal && createModal === 'facebook') {
      const trigger = <a>+ {__('Add')}</a>;
      return (
        <ModalTrigger title="Add facebook page" trigger={trigger}>
          <Facebook />
        </ModalTrigger>
      );
    }

    return null;
  }

  renderType(inMessenger) {
    if (inMessenger) {
      return (
        <Tip text="Works in messenger">
          <Icon icon="chat" />
        </Tip>
      );
    }

    return null;
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

IntegrationEntry.propTypes = propTypes;
IntegrationEntry.contextTypes = {
  __: PropTypes.func
};

export default IntegrationEntry;
