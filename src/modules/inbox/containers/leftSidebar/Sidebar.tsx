import { Bulk } from 'modules/common/components';
import { Sidebar as DumbSidebar } from 'modules/inbox/components/leftSidebar';
import { KIND_CHOICES as INTEGRATIONS_TYPES } from 'modules/settings/integrations/constants';
import * as React from 'react';
import { withRouter } from 'react-router';
import { IRouterProps } from '../../../common/types';

type Props = {
  queryParams: any;
  currentConversationId?: string;
} & IRouterProps;

class Sidebar extends React.Component<Props> {
  render() {
    const integrations = INTEGRATIONS_TYPES.ALL_LIST.map(item => ({
      _id: item,
      name: item
    }));

    const updatedProps = {
      ...this.props,
      integrations
    };

    const content = props => {
      return <DumbSidebar {...updatedProps} {...props} />;
    };

    return <Bulk content={content} />;
  }
}

export default withRouter<Props>(Sidebar);
