import DataWithLoader from 'modules/common/components/DataWithLoader';
import EmptyContent from 'modules/common/components/empty/EmptyContent';
import Label from 'modules/common/components/Label';
import Table from 'modules/common/components/table';
import { __ } from 'modules/common/utils';
import Wrapper from 'modules/layout/components/Wrapper';
import { EMPTY_SEGMENT_CONTENT } from 'modules/settings/constants';
import React from 'react';
import Sidebar from './Sidebar';
import { IOptions } from 'modules/boards/types';

type Props = {
  queryParams: any;
  options: IOptions;
  contentType?: string;
};

class ActivityLogs extends React.Component<Props> {
  renderContent(options) {
    return (
      <Table>
        <thead>
          <tr>
            <th>{__('Name')}</th>
            <th>{__('Description')}</th>
            <th>{__('Color')}</th>
            <th style={{ width: 80 }} />
          </tr>
        </thead>
        <tbody id={'SegmentShowing'}>
          {options.map(option => (
            <tr key={option._id}>
              <td>
                {option.subOf ? '\u00a0\u00a0' : null} {option.name}
              </td>
              <td>{option.description}</td>
              <td>
                <Label lblColor={option.color}>{option.color}</Label>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    );
  }

  render() {
    const parentOptions: IOptions[] = [];

    return (
      <Wrapper
        content={
          <DataWithLoader
            data={this.renderContent(parentOptions)}
            count={parentOptions.length}
            emptyContent={
              <EmptyContent
                content={EMPTY_SEGMENT_CONTENT}
                maxItemWidth="330px"
              />
            }
          />
        }
        leftSidebar={<Sidebar />}
      />
    );
  }
}

export default ActivityLogs;
