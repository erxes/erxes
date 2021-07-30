import Button from 'modules/common/components/Button';
import DataWithLoader from 'modules/common/components/DataWithLoader';
import EmptyState from 'modules/common/components/EmptyState';
import HeaderDescription from 'modules/common/components/HeaderDescription';
import ModalTrigger from 'modules/common/components/ModalTrigger';
import Pagination from 'modules/common/components/pagination/Pagination';
import { Title } from 'modules/common/styles/main';
import { __ } from 'modules/common/utils';
import Wrapper from 'modules/layout/components/Wrapper';
import IntegrationList from 'modules/settings/integrations/containers/common/IntegrationList';
import React from 'react';
import ManageIntegrations from '../containers/ManageIntegrations';
import Sidebar from '../containers/Sidebar';
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
            background="colorWhite"
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
      />
    );
  }
}

export default Channels;
