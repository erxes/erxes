import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { __ } from '@erxes/ui/src/utils/core';
import React from 'react';

import { IBuilding } from '../../types';
import LeftSideBar from './LeftSideBar';
import RightSidebar from './RightSideBar';

// import { BuildingTitle } from '../../styles';

type Props = {
  building: IBuilding;
};

const BuildingDetail = (props: Props) => {
  const { building } = props;

  const name = building.name || '-';

  const breadcrumb = [
    {
      title: __('Buildings'),
      link: '/mobinet/building/list'
    }
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
      mainHead={name}
      leftSidebar={<LeftSideBar building={building} />}
      rightSidebar={<RightSidebar building={building} />}
      content={content}
      transparent={true}
    />
  );
};

export default BuildingDetail;
