import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { isEnabled, __ } from '@erxes/ui/src/utils/core';
import React from 'react';
import { UserHeader } from '@erxes/ui-contacts/src/customers/styles';

import { IBuilding } from '../../types';
import LeftSideBar from './LeftSideBar';
import RightSidebar from './RightSideBar';
import InfoSection from './sections/InfoSection';
import ActivityInputs from '@erxes/ui-log/src/activityLogs/components/ActivityInputs';
import ActivityLogs from '@erxes/ui-log/src/activityLogs/containers/ActivityLogs';

type Props = {
  building: IBuilding;
  assets: any[];
  onUpdate: (data: any) => void;
  refetch: () => void;
};

const BuildingDetail = (props: Props) => {
  const { building, assets } = props;

  const name = building.name || '-';

  const breadcrumb = [
    {
      title: __('Buildings'),
      link: '/mobinet/building/list',
    },
    { title: name },
  ];

  const content = (
    <>
      <ActivityInputs
        contentTypeId={building._id}
        contentType="mobinet:buildings"
        showEmail={false}
      />
      {isEnabled('logs') && (
        <ActivityLogs
          target={name || ''}
          contentId={building._id}
          contentType="mobinet:buildings"
          extraTabs={[]}
        />
      )}
    </>
  );

  return (
    <Wrapper
      header={<Wrapper.Header title={name} breadcrumb={breadcrumb} />}
      mainHead={
        <UserHeader>
          <InfoSection building={building} refetch={props.refetch} />
          {/* <ActionSection customer={customer} /> */}
          {/* action section */}
          {/* </InfoSection> */}
          {/* <LeadState customer={customer} /> */}
        </UserHeader>
      }
      leftSidebar={<LeftSideBar building={building} />}
      rightSidebar={
        <RightSidebar
          building={building}
          assets={assets}
          onUpdate={props.onUpdate}
        />
      }
      content={content}
      transparent={true}
    />
  );
};

export default BuildingDetail;
