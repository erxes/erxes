import ActivityInputs from '@erxes/ui-log/src/activityLogs/components/ActivityInputs';
import ActivityLogs from '@erxes/ui-log/src/activityLogs/containers/ActivityLogs';
import LeftSidebar from './LeftSideBar';
import React from 'react';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { __ } from '@erxes/ui/src/utils';
import { isEnabled } from '@erxes/ui/src/utils/core';
import { ContentBox } from '@erxes/ui-settings/src/styles';

import { IItem } from '../.././types';

type Props = {
  item: IItem;
};

class Details extends React.Component<Props> {
  render() {
    const { item } = this.props;

    const title = item.name || 'Unknown';

    const breadcrumb = [
      { title: __('Settings'), link: '/settings' },
      { title: __('Items'), link: '/settings/items' },
      { title },
    ];

    const content = (
      <ContentBox>
        <ActivityInputs
          contentTypeId={item._id}
          contentType="items:item"
          showEmail={false}
        />
        {isEnabled('logs') && (
          <ActivityLogs
            target={item.name || ''}
            contentId={item._id}
            contentType="items:item"
            extraTabs={[]}
          />
        )}
      </ContentBox>
    );

    return (
      <Wrapper
        header={<Wrapper.Header title={title} breadcrumb={breadcrumb} />}
        leftSidebar={<LeftSidebar {...this.props} />}
        content={content}
        transparent={true}
        hasBorder={true}
      />
    );
  }
}

export default Details;
