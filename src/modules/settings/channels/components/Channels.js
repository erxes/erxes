import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Wrapper } from 'modules/layout/components';
import { Sidebar, IntegrationList, IntegrationForm } from '../containers';
import {
  Pagination,
  EmptyState,
  Button,
  ModalTrigger
} from 'modules/common/components';

const propTypes = {
  totalIntegrationsCount: PropTypes.number.isRequired,
  queryParams: PropTypes.object,
  currentChannel: PropTypes.object
};

class Channels extends Component {
  renderIntegrations() {
    const { currentChannel, queryParams } = this.props;

    if (currentChannel._id) {
      return (
        <IntegrationList
          currentChannel={currentChannel}
          queryParams={queryParams}
        />
      );
    }
    return (
      <EmptyState
        text="There aren’t any integration at the moment."
        icon="network"
      />
    );
  }

  render() {
    const { totalIntegrationsCount, currentChannel } = this.props;

    const breadcrumb = [
      { title: 'Settings', link: '/settings' },
      { title: 'Channels', link: '/settings/channels' },
      { title: `${currentChannel.name}` }
    ];

    const trigger = (
      <Button btnStyle="success" size="small" icon="wrench">
        Manage integration
      </Button>
    );

    const rightActionBar = currentChannel._id && (
      <ModalTrigger title="Manage Integration" trigger={trigger} size="lg">
        <IntegrationForm currentChannel={currentChannel} />
      </ModalTrigger>
    );

    return (
      <Wrapper
        header={<Wrapper.Header breadcrumb={breadcrumb} />}
        actionBar={<Wrapper.ActionBar right={rightActionBar} />}
        leftSidebar={<Sidebar currentChannelId={currentChannel._id} />}
        footer={
          currentChannel._id && <Pagination count={totalIntegrationsCount} />
        }
        content={this.renderIntegrations()}
      />
    );
  }
}

Channels.propTypes = propTypes;

export default Channels;
