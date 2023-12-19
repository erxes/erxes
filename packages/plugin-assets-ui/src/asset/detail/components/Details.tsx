import ActivityInputs from '@erxes/ui-log/src/activityLogs/components/ActivityInputs';
import ActivityLogs from '@erxes/ui-log/src/activityLogs/containers/ActivityLogs';
import { IUser } from '@erxes/ui/src/auth/types';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { __ } from '@erxes/ui/src/utils';
import { isEnabled } from '@erxes/ui/src/utils/core';
import React from 'react';
import { IAsset } from '../../../common/types';
import LeftSidebar from './LeftSideBar';

type Props = {
  asset: IAsset;
  currentUser: IUser;
  history: any;
  refetchDetail: () => void;
};

class AssetDetail extends React.Component<Props> {
  render() {
    const { asset } = this.props;

    const title = asset.name || 'Unknown';

    const breadcrumb = [
      { title: __('Settings'), link: '/settings' },
      { title: __('Assets'), link: '/settings/assets' },
      { title }
    ];

    const content = (
      <>
        <ActivityInputs
          contentTypeId={asset._id}
          contentType="assets:asset"
          showEmail={false}
        />
        {isEnabled('logs') && (
          <ActivityLogs
            target={asset.name || ''}
            contentId={asset._id}
            contentType="assets:asset"
            extraTabs={[]}
          />
        )}
      </>
    );

    return (
      <Wrapper
        header={<Wrapper.Header title={title} breadcrumb={breadcrumb} />}
        leftSidebar={<LeftSidebar {...this.props} />}
        content={content}
        transparent={true}
      />
    );
  }
}

export default AssetDetail;
