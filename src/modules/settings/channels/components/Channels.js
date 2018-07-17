import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Wrapper } from 'modules/layout/components';
import {
  Pagination,
  DataWithLoader,
  Button,
  ModalTrigger
} from 'modules/common/components';
import { Sidebar } from '../containers';
import { IntegrationList, ManageIntegration } from '../../common/containers';

const propTypes = {
  integrationsCount: PropTypes.number.isRequired,
  queryParams: PropTypes.object,
  refetch: PropTypes.func,
  currentChannel: PropTypes.object,
  loading: PropTypes.bool
};

class Channels extends Component {
  render() {
    const {
      integrationsCount,
      currentChannel,
      queryParams,
      loading,
      refetch
    } = this.props;
    const { __ } = this.context;

    const breadcrumb = [
      { title: __('Settings'), link: '/settings' },
      { title: __('Channels'), link: '/settings/channels' },
      { title: `${currentChannel.name || ''}` }
    ];

    const trigger = (
      <Button btnStyle="success" size="small" icon="computer">
        Manage integration
      </Button>
    );

    const rightActionBar = currentChannel._id && (
      <ModalTrigger title="Manage Integration" trigger={trigger} size="lg">
        <ManageIntegration current={currentChannel} type="channel" />
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
        footer={currentChannel._id && <Pagination count={integrationsCount} />}
        content={
          <DataWithLoader
            data={
              <IntegrationList
                currentChannel={currentChannel}
                queryParams={queryParams}
                refetch={refetch}
                showBrand
              />
            }
            loading={loading}
            count={integrationsCount}
            emptyText="There is no integration in this channel."
            emptyImage="/images/robots/robot-05.svg"
          />
        }
      />
    );
  }
}

Channels.propTypes = propTypes;
Channels.contextTypes = {
  __: PropTypes.func
};

export default Channels;
