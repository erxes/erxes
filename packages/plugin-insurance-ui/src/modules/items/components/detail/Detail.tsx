import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { isEnabled, __ } from '@erxes/ui/src/utils/core';
import React from 'react';
import { UserHeader } from '@erxes/ui-contacts/src/customers/styles';

import LeftSideBar from './LeftSideBar';
import RightSidebar from './RightSideBar';
import InfoSection from './sections/InfoSection';
import ActivityInputs from '@erxes/ui-log/src/activityLogs/components/ActivityInputs';
import ActivityLogs from '@erxes/ui-log/src/activityLogs/containers/ActivityLogs';
import { InsuranceItem } from "../../../../gql/types";

type Props = {
    item:InsuranceItem;
    onUpdate: (data: any) => void;
};

const Detail = (props: Props) => {
    const { item } = props;

    const name = item.deal?.number || '-';
  
    const breadcrumb = [
      {
        title: __('Items'),
        link: '/insurance/items/list',
      },
      { title: name },
    ];
  
    const content = (
      <>
        <ActivityInputs
          contentTypeId={item.deal?._id || ''}
          contentType="cards:deal"
          showEmail={false}
        />
        {isEnabled('logs') && (
          <ActivityLogs
            target={name || ''}
            contentId={item.deal?._id || ''}
            contentType="cards:deal"
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
            <InfoSection item={item} >
            {/* <ActionSection customer={customer} /> */}
            {/* action section */}
            </InfoSection>
            {/* <LeadState customer={customer} /> */}
          </UserHeader>
        }
        leftSidebar={<LeftSideBar item={item} />}
        rightSidebar={
          <RightSidebar
          item={item}
            // assets={assets}
            onUpdate={props.onUpdate}
          />
        }
        content={content}
        transparent={true}
      />
    );
  };
  
  export default Detail;
  
