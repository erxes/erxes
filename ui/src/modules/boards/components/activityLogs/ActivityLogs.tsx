import DataWithLoader from 'modules/common/components/DataWithLoader';
import Table from 'modules/common/components/table';
import { __ } from 'modules/common/utils';
import Wrapper from 'modules/layout/components/Wrapper';
import React from 'react';
import Sidebar from './Sidebar';
import { IOptions } from 'modules/boards/types';

type Props = {
  queryParams: any;
  options: IOptions;
  contentType?: string;
};

class ActivityLogs extends React.Component<Props> {
  renderContent() {
    return (
      <Table>
        <thead>
          <tr>
            <th>{__('Date')}</th>
            <th>{__('Created by')}</th>
            <th>{__('Action')}</th>
            <th>{__('Description')}</th>
          </tr>
        </thead>
        <tbody id={'activityShow'}>
          <tr key="11">
            <td>hi</td>
            <td>Dulmaa</td>
            <td>doing</td>
            <td>hello</td>
          </tr>
        </tbody>
      </Table>
    );
  }

  render() {
    return (
      <Wrapper
        content={<DataWithLoader data={this.renderContent()} />}
        leftSidebar={<Sidebar />}
      />
    );
  }
}

export default ActivityLogs;
