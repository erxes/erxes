import { Bulk } from 'modules/common/components';
import { Sidebar as DumbSidebar } from 'modules/inbox/components/leftSidebar';
import { KIND_CHOICES as INTEGRATIONS_TYPES } from 'modules/settings/integrations/constants';
import * as React from 'react';
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

    const updatedProps = {
      ...this.props,
      integrations,
      config: getConfig(STORAGE_KEY),
      toggleSidebar: this.toggle
    };

    const content = props => {
      return <DumbSidebar {...updatedProps} {...props} />;
    };

    return <Bulk content={content} />;
  }
}

export default withRouter<Props>(Sidebar);
