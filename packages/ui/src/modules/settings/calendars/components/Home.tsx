import EmptyState from 'modules/common/components/EmptyState';
import HeaderDescription from 'modules/common/components/HeaderDescription';
import { __ } from 'modules/common/utils';
import Wrapper from 'modules/layout/components/Wrapper';
import React from 'react';
import Boards from '../containers/Boards';
import Groups from '../containers/Groups';

type Props = {
  boardId: string;
  queryParams: any;
  history: any;
};

class Home extends React.Component<Props, {}> {
  render() {
    const { boardId, queryParams, history } = this.props;

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
            title={__(`Group & Calendar`)}
            description={`${__(
              `Manage your boards and calendars so that its easy to manage incoming pop ups or requests that is adaptable to your team's needs`
            )}.${__(
              `Add in or delete boards and calendars to keep business development on track and in check`
            )}`}
          />
        }
        leftSidebar={<Boards currentBoardId={boardId} />}
        content={
          boardId ? (
            <Groups
              boardId={boardId}
              queryParams={queryParams}
              history={history}
            />
          ) : (
            <EmptyState
              text={`Get started on your board`}
              image="/images/actions/16.svg"
            />
          )
        }
      />
    );
  }
}

export default Home;
