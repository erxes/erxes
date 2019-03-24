import { ActivityList } from 'modules/activityLogs/components';
import { IUser } from 'modules/auth/types';
import { DataWithLoader } from 'modules/common/components';
import { __ } from 'modules/common/utils';
import { ICustomer } from 'modules/customers/types';
import { hasAnyActivity } from 'modules/customers/utils';
import { Form as NoteForm } from 'modules/internalNotes/containers';
import * as React from 'react';
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
          <NoteForm contentType="customer" contentTypeId={customer._id} />
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
