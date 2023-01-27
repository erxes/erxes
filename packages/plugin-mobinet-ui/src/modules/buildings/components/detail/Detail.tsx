import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { __ } from '@erxes/ui/src/utils/core';
import React from 'react';
import { UserHeader } from '@erxes/ui-contacts/src/customers/styles';

import { IBuilding } from '../../types';
import LeftSideBar from './LeftSideBar';
import RightSidebar from './RightSideBar';
import InfoSection from './sections/InfoSection';

// import { BuildingTitle } from '../../styles';

type Props = {
  building: IBuilding;
  onSelectContacts: (datas: any, type: string) => void;
};

const BuildingDetail = (props: Props) => {
  const { building } = props;

  const name = building.name || '-';

  const breadcrumb = [
    {
      title: __('Buildings'),
      link: '/mobinet/building/list'
    },
    { title: name }
  ];

  const content = (
    // <Map
    //   id={Math.random().toString(10)}
    //   // center={route.directions[0].places[0].center}
    //   center={{ lat: 47.919, lng: 106.917 }}
    //   zoom={7}
    //   locationOptions={[...new Set(locationOptions)]}
    //   streetViewControl={false}
    //   connectWithLines={true}
    //   fullHeight={true}
    //   trackingData={building.trackingData}
    //   googleMapPath={
    //     route &&
    //     route.directions.map(
    //       dir => (dir.googleMapPath && dir.googleMapPath) || ''
    //     )
    //   }
    // />
    <>content here</>
  );

  return (
    <Wrapper
      header={<Wrapper.Header title={name} breadcrumb={breadcrumb} />}
      mainHead={
        <UserHeader>
          <InfoSection building={building} />
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
          onSelectContacts={props.onSelectContacts}
        />
      }
      content={content}
      transparent={true}
    />
  );
};

export default BuildingDetail;
