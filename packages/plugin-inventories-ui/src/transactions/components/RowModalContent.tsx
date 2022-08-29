import React from 'react';
import dayjs from 'dayjs';
// erxes
import { __ } from '@erxes/ui/src/utils/core';
import Table from '@erxes/ui/src/components/table';
import TextInfo from '@erxes/ui/src/components/TextInfo';
import Label from '@erxes/ui/src/components/Label';
import Spinner from '@erxes/ui/src/components/Spinner';
import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
import EmptyState from '@erxes/ui/src/components/EmptyState';
import { FlexContent, FlexItem } from '@erxes/ui/src/layout/styles';

type Props = {
  loading: boolean;
  data: any;
};

export default function RowModalContent(props: Props) {
  const { loading = false, data } = props;

  const renderTransactionItems = () => {
    return (data.transactionItems || []).map((item: any, index: number) => {
      return (
        <tr key={index}>
          <td>{item.productId || ''}</td>
          <td>{item.count || ''}</td>
          <td>
            {item.isDebit ? (
              <Label lblStyle="success">True</Label>
            ) : (
              <Label lblStyle="danger">False</Label>
            )}
          </td>
          <td>
            {(item.modifiedAt && dayjs(item.modifiedAt).format('ll')) || ''}
          </td>
        </tr>
      );
    });
  };

  if (loading) <Spinner />;

  const content = (
    <div>
      <FlexContent>
        <FlexItem>
          <TextInfo hugeness="big">Branch</TextInfo>
          <br />
          {((data && data.branch) || {}).title || 'Branch'}
        </FlexItem>
        <FlexItem>
          <TextInfo hugeness="big">Department</TextInfo>
          <br />
          {((data && data.department) || {}).title || 'Department'}
        </FlexItem>
        <FlexItem>
          <TextInfo hugeness="big">Content Type</TextInfo>
          <br />
          {data && data.contentType}
        </FlexItem>
        <FlexItem>
          <TextInfo hugeness="big">Created Date</TextInfo>
          <br />
          {dayjs(data.createdAt).format('ll') || 'Created at'}
        </FlexItem>
      </FlexContent>
      <br />

      <TextInfo hugeness="big">Transaction Items</TextInfo>

      <Table>
        <thead>
          <tr>
            <th>{__('PRODUCT ID')}</th>
            <th>{__('COUNT')}</th>
            <th>{__('DEBIT')}</th>
            <th>{__('MODIFIED AT')}</th>
          </tr>
        </thead>
        <tbody>{renderTransactionItems()}</tbody>
      </Table>
    </div>
  );

  return (
    <DataWithLoader
      data={content}
      loading={loading}
      emptyContent={
        <EmptyState
          image="/images/actions/5.svg"
          text="No transactions"
          size=""
        />
      }
    />
  );
}
