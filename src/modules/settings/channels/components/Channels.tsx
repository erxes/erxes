import {
  Button,
  DataWithLoader,
  ModalTrigger,
  Pagination
} from 'modules/common/components';
import { __ } from 'modules/common/utils';
import { Wrapper } from 'modules/layout/components';
import { IntegrationList } from 'modules/settings/integrations/containers/common';
import { DescImg, MainDescription } from 'modules/settings/styles';
import * as React from 'react';
import { ManageIntegrations, Sidebar } from '../containers';
import { IChannel } from '../types';

type Props = {
  integrationsCount: number;
  queryParams: any;
  currentChannel: IChannel;
  loading: boolean;
};

class Channels extends React.Component<Props, {}> {
  render() {
    const {
      integrationsCount,
      currentChannel,
      queryParams,
      loading
    } = this.props;

    const breadcrumb = [
      { title: __('Settings'), link: '/settings' },
      { title: __('Channels'), link: '/settings/channels' },
      { title: `${currentChannel.name || ''}` }
    ];

    const actionBarLeft = (
      <MainDescription>
        <DescImg src="/images/actions/31.svg" />
        <span>
          <h4>{__('Channels')}</h4>
          {__(
            'Channels are important to know how and where your team members are spread out. Manage your channels and stay at the top of your game.'
          )}
        </span>
      </MainDescription>
    );

    const trigger = (
      <Button btnStyle="success" size="small" icon="computer">
        Manage integration
      </Button>
    );

    const content = props => (
      <ManageIntegrations
        {...props}
        queryParams={queryParams}
        currentChannel={currentChannel}
      />
    );

    const rightActionBar = currentChannel._id && (
      <ModalTrigger
        title="Manage Integration"
        trigger={trigger}
        size="lg"
        content={content}
      />
    );

    return (
      <Wrapper
        header={<Wrapper.Header breadcrumb={breadcrumb} />}
        actionBar={
          <Wrapper.ActionBar left={actionBarLeft} right={rightActionBar} />
        }
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
                queryParams={queryParams}
                variables={{ channelId: currentChannel._id }}
              />
            }
            loading={loading}
            count={integrationsCount}
            emptyText="Choose from our many integrations and add to your channel"
            emptyImage="/images/actions/2.svg"
          />
        }
      />
    );
  }
}

export default Channels;
