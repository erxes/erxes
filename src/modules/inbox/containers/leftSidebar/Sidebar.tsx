import { AppConsumer } from 'appContext';
import Bulk from 'modules/common/components/Bulk';
import { IBulkContentProps } from 'modules/common/components/Bulk';
import DumbSidebar from 'modules/inbox/components/leftSidebar/Sidebar';
import { KIND_CHOICES as INTEGRATIONS_TYPES } from 'modules/settings/integrations/constants';
import React from 'react';
import { withRouter } from 'react-router';
import { IRouterProps } from '../../../common/types';
import { getConfig, setConfig } from '../../utils';

type Props = {
  queryParams: any;
  currentConversationId?: string;
} & IRouterProps;

const STORAGE_KEY = 'erxes_additional_sidebar_config';

class Sidebar extends React.Component<Props> {
  toggle = ({ isOpen }: { isOpen: boolean }) => {
    const config = getConfig(STORAGE_KEY);

    config.showAddition = isOpen;

    setConfig(STORAGE_KEY, config);
  };

  render() {
    if (!localStorage.getItem(STORAGE_KEY)) {
      setConfig(STORAGE_KEY, {
        showAddition: false,
        showChannels: true,
        showBrands: false,
        showIntegrations: false,
        showTags: false
      });
    }

    const integrations = INTEGRATIONS_TYPES.ALL_LIST.map(item => ({
      _id: item,
      name: item
    }));

    const { currentConversationId, queryParams, history } = this.props;

    const content = ({ bulk, toggleBulk, emptyBulk }: IBulkContentProps) => {
      return (
        <AppConsumer>
          {({ currentUser }) => (
            <DumbSidebar
              currentUser={currentUser}
              currentConversationId={currentConversationId}
              queryParams={queryParams}
              integrations={integrations}
              history={history}
              bulk={bulk}
              emptyBulk={emptyBulk}
              toggleBulk={toggleBulk}
              config={getConfig(STORAGE_KEY)}
              toggleSidebar={this.toggle}
            />
          )}
        </AppConsumer>
      );
    };

    return <Bulk content={content} />;
  }
}

export default withRouter<Props>(Sidebar);
