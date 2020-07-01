import { getEnv } from 'apolloClient';
import { BoardContainer, BoardContent } from 'modules/boards/styles/common';
import { __ } from 'modules/common/utils';
import Header from 'modules/layout/components/Header';
import React from 'react';

const { REACT_APP_DASHBOARD_URL } = getEnv();

type Props = {
  id: string;
};

class DashboardDetail extends React.Component<Props, {}> {
  render() {
    const { id } = this.props;

    return (
      <BoardContainer>
        <Header
          title={`${'Dashboard' || ''}`}
          breadcrumb={[{ title: __('Dashboard') }]}
        />

        <BoardContent transparent={true} bgColor="transparent">
          <iframe
            title="dashboard"
            width="100%"
            height="100%"
            src={`${REACT_APP_DASHBOARD_URL}/explore?dashboardId=${id}`}
            frameBorder="0"
            allowFullScreen={true}
          />
        </BoardContent>
      </BoardContainer>
    );
  }
}

export default DashboardDetail;
