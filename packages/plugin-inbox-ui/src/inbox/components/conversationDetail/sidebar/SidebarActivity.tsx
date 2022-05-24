import ActivityList from '@erxes/ui-logs/src/activityLogs/components/ActivityList';
import { IUser } from '@erxes/ui/src/auth/types';
import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
import { __ } from 'coreui/utils';
import { ICustomer } from '@erxes/ui/src/customers/types';
import { hasAnyActivity } from '@erxes/ui-inbox/src/inbox/utils';
import NoteForm from '@erxes/ui/src/internalNotes/containers/Form';
import React from 'react';
import { ActivityLogContent, NoteFormContainer } from './styles';

type Props = {
  customer: ICustomer;
  loadingLogs: boolean;
  activityLogsCustomer: any[];
  currentSubTab: string;
  currentUser: IUser;
};

class SidebarActivity extends React.Component<Props> {
  render() {
    const {
      customer,
      activityLogsCustomer,
      loadingLogs,
      currentUser,
      currentSubTab
    } = this.props;

    const hasActivity = hasAnyActivity(activityLogsCustomer);

    return (
      <>
        <NoteFormContainer>
          <span>{__('Add a note') as string}:</span>
          <NoteForm
            contentType="contacts:customer"
            contentTypeId={customer._id}
          />
        </NoteFormContainer>

        <ActivityLogContent isEmpty={!hasActivity}>
          <DataWithLoader
            loading={loadingLogs}
            count={!loadingLogs && hasActivity ? 1 : 0}
            data={
              <ActivityList
                user={currentUser}
                activities={activityLogsCustomer}
                target={customer.firstName}
                type={currentSubTab} // show logs filtered by type
              />
            }
            emptyText="No Activities"
            emptyImage="/images/actions/19.svg"
          />
        </ActivityLogContent>
      </>
    );
  }
}

export default SidebarActivity;
