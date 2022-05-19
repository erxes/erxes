import {
  __,
  ActivityInputs,
  ActivityLogsContainer as ActivityLogs,
  Wrapper
} from '@erxes/ui/src';
import React from 'react';
import { ICar } from '../../types';
import LeftSidebar from './LeftSidebar';
import RightSidebar from './RightSidebar';
import { IUser } from '@erxes/ui/src/auth/types';

type Props = {
  car: ICar;
  currentUser: IUser;
};

class CarDetails extends React.Component<Props> {
  render() {
    const { car } = this.props;

    const title = car.plateNumber || 'Unknown';

    const breadcrumb = [
      { title: __('Cars'), link: '/erxes-plugin-tumentech/list' },
      { title }
    ];

    const content = (
      <>
        <ActivityInputs
          contentTypeId={car._id}
          contentType="car"
          showEmail={false}
        />
        <ActivityLogs
          target={car.plateNumber || ''}
          contentId={car._id}
          contentType="tumentech:car"
          extraTabs={[]}
        />
      </>
    );

    return (
      <Wrapper
        header={<Wrapper.Header title={title} breadcrumb={breadcrumb} />}
        leftSidebar={<LeftSidebar {...this.props} />}
        rightSidebar={<RightSidebar car={car} />}
        content={content}
        transparent={true}
      />
    );
  }
}

export default CarDetails;
