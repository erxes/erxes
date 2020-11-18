import HeaderDescription from 'modules/common/components/HeaderDescription';
import { __ } from 'modules/common/utils';
import Wrapper from 'modules/layout/components/Wrapper';
import React from 'react';
import Calendars from '../containers/Calendars';
import Groups from '../containers/Groups';

type Props = {
  groupId: string;
  queryParams: any;
  history: any;
};

class Home extends React.Component<Props, {}> {
  render() {
    const { groupId, queryParams, history } = this.props;

    const breadcrumb = [
      { title: __('Settings'), link: '/settings' },
      { title: __('Calendar'), link: `/settings/calendars` }
    ];

    return (
      <Wrapper
        header={
          <Wrapper.Header title={__('Calendar')} breadcrumb={breadcrumb} />
        }
        mainHead={
          <HeaderDescription
            icon="/images/actions/34.svg"
            title={`Group & Calendar`}
            description="Manage your groups and calendars so that its easy to manage incoming pop ups or requests that is adaptable to your team's needs. Add in or delete groups and calendars to keep business development on track and in check."
          />
        }
        leftSidebar={<Groups currentGroupId={groupId} />}
        content={
          <Calendars
            groupId={groupId}
            queryParams={queryParams}
            history={history}
          />
        }
      />
    );
  }
}

export default Home;
