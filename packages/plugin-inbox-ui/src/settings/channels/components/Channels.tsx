import Button from '@erxes/ui/src/components/Button';
import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
import EmptyState from '@erxes/ui/src/components/EmptyState';
import HeaderDescription from '@erxes/ui/src/components/HeaderDescription';
import { IChannel } from '@erxes/ui-inbox/src/settings/channels/types';
import IntegrationList from '@erxes/ui-inbox/src/settings/integrations/containers/common/IntegrationList';
import ManageIntegrations from '../containers/ManageIntegrations';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import Pagination from '@erxes/ui/src/components/pagination/Pagination';
import React from 'react';
import Sidebar from '../containers/Sidebar';
import { Title } from '@erxes/ui-settings/src/styles';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { __ } from 'coreui/utils';

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

    if (!currentChannel._id) {
      return (
        <EmptyState
          image="/images/actions/8.svg"
          text="No Channels"
          size="small"
        />
      );
    }

    const trigger = (
      <Button btnStyle="simple" icon="web-grid-alt">
        {__('Manage integration')}
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
        autoOpenKey="showManageIntegrationModal"
        content={content}
      />
    );

    const leftActionBar = <Title>{currentChannel.name}</Title>;

    return (
      <Wrapper
        header={
          <Wrapper.Header
            title={`${currentChannel.name || ''}`}
            breadcrumb={breadcrumb}
          />
        }
        mainHead={
          <HeaderDescription
            icon="/images/actions/31.svg"
            title={'Channels'}
            description={`${__(
              `Channels are important to know how and where your team members are spread out`
            )}.${__(`Manage your channels and stay at the top of your game`)}`}
          />
        }
        leftSidebar={
          <Sidebar
            currentChannelId={currentChannel._id}
            queryParams={queryParams}
          />
        }
        actionBar={
          <Wrapper.ActionBar
            left={leftActionBar}
            right={rightActionBar}
            wideSpacing
          />
        }
        content={
          <DataWithLoader
            data={
              <IntegrationList
                queryParams={queryParams}
                variables={{ channelId: currentChannel._id }}
                disableAction={true}
                integrationsCount={integrationsCount}
              />
            }
            loading={loading}
            count={integrationsCount}
            emptyText={__(
              'Choose from our many integrations and add to your channel'
            )}
            emptyImage="/images/actions/2.svg"
          />
        }
        footer={currentChannel._id && <Pagination count={integrationsCount} />}
        transparent={true}
        hasBorder
      />
    );
  }
}

export default Channels;
