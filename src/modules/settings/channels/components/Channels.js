import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Wrapper } from 'modules/layout/components';
import { Sidebar, IntegrationList, IntegrationForm } from '../containers';
import {
  Pagination,
  DataWithLoader,
  Button,
  ModalTrigger
} from 'modules/common/components';

const propTypes = {
  totalIntegrationsCount: PropTypes.number.isRequired,
  queryParams: PropTypes.object,
  currentChannel: PropTypes.object,
  loading: PropTypes.bool
};

class Channels extends Component {
  render() {
    const {
      totalIntegrationsCount,
      currentChannel,
      queryParams,
      loading
    } = this.props;

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
        leftSidebar={
          <Sidebar
            currentChannelId={currentChannel._id}
            queryParams={queryParams}
          />
        }
        footer={
          currentChannel._id && <Pagination count={totalIntegrationsCount} />
        }
        content={
          <DataWithLoader
            data={
              <IntegrationList
                currentChannel={currentChannel}
                queryParams={queryParams}
              />
            }
            loading={loading}
            count={totalIntegrationsCount}
            emptyText="There is no integration in this channel."
            emptyImage="/images/robots/robot-05.svg"
          />
        }
      />
    );
  }
}

Channels.propTypes = propTypes;

export default Channels;
