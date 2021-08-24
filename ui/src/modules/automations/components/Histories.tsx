import React from 'react';
import dayjs from 'dayjs';
import Table from 'modules/common/components/table';
import { __ } from 'modules/common/utils';
import withTableWrapper from 'modules/common/components/table/withTableWrapper';

export default function Histories(props: any) {
  const renderContent = () => {
    return (
      <withTableWrapper.Wrapper>
        <Table whiteSpace="nowrap" bordered={true} hover={true}>
          <thead>
            <tr>
              <th>{__('Description')}</th>
              <th>{__('Created date')}</th>
            </tr>
          </thead>
          <tbody id="automationHistories">
            {props.histories.map((row, index) => (
              <tr key={index}>
                <td>{row.description}</td>
                <td>{dayjs(row.createdAt).format('lll')}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </withTableWrapper.Wrapper>
    );
  };

  return renderContent();
}
