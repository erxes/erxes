import ActivityInputs from '@erxes/ui/src/activityLogs/components/ActivityInputs';
import ActivityLogs from '@erxes/ui/src/activityLogs/containers/ActivityLogs';
import Icon from '@erxes/ui/src/components/Icon';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import { TabTitle } from '@erxes/ui/src/components/tabs';
import ActionSection from '@erxes/ui-contacts/src/customers/containers/ActionSection';
import { UserHeader } from '@erxes/ui-contacts/src/customers/styles';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import React from 'react';
import InfoSection from '@erxes/ui-contacts/src/customers/components/common/InfoSection';
import { isEnabled, renderFullName, __ } from '@erxes/ui/src/utils/core';
import {
  ICustomer,
  IFieldsVisibility
} from '@erxes/ui-contacts/src/customers/types';
import LeftSidebar from '../../../../plugin-contacts-ui/src/customers/components/detail/LeftSidebar';
import RightSidebar from '../../../../plugin-contacts-ui/src/customers/components/detail/RightSidebar';
import { ITrip } from '../../types';

type Props = {
  trip: ITrip;
};

class CustomerDetails extends React.Component<Props> {
  render() {
    const { trip } = this.props;

    const breadcrumb = [{ title: __('Trip'), link: '/trip' }];

    const content = <></>;

    return (
      <Wrapper
        header={<Wrapper.Header title={trip._id} breadcrumb={breadcrumb} />}
        mainHead={<UserHeader></UserHeader>}
        leftSidebar={
          //   <LeftSidebar
          //     wide={true}
          //     customer={customer}
          //     fieldsVisibility={fieldsVisibility}
          //     deviceFields={deviceFields}
          //     fields={fields}
          //     taggerRefetchQueries={taggerRefetchQueries}
          //     deviceFieldsVisibility={deviceFieldsVisibility}
          //   />
          <>left side bar</>
        }
        rightSidebar={
          <>right side bar</>
          // <RightSidebar customer={customer} />
        }
        content={content}
        transparent={true}
      />
    );
  }
}

export default CustomerDetails;
