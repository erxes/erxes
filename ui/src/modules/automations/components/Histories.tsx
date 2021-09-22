import React from 'react';
import dayjs from 'dayjs';
import Table from 'modules/common/components/table';
import { __, renderFullName } from 'modules/common/utils';
import { Link } from 'react-router-dom';
import withTableWrapper from 'modules/common/components/table/withTableWrapper';
import EmptyState from 'modules/common/components/EmptyState';

const generateName = ({ triggerType, target }: any) => {
  switch (triggerType) {
    case 'visitor':
    case 'lead':
    case 'customer': {
      return (
        <Link target="_blank" to={`/contacts/details/${target._id}`}>
          {renderFullName(target)}
        </Link>
      );
    }

    case 'company': {
      return (
        <Link target="_blank" to={`/companies/details/${target._id}`}>
          {target.name}
        </Link>
      );
    }

    case 'deal':
    case 'task':
    case 'ticket': {
      return target.name;
    }

    default: {
      return '';
    }
  }
};

export default function Histories(props: any) {
  if (!props.histories || props.histories.length === 0) {
    return (
      <EmptyState
        image="/images/actions/14.svg"
        text="There is no history at the moment"
        size="full"
      />
    );
  }

  return (
    <withTableWrapper.Wrapper>
      <Table whiteSpace="nowrap" bordered={true} hover={true}>
        <thead>
          <tr>
            <th>{__('Title')}</th>
            <th>{__('Description')}</th>
            <th>{__('Time')}</th>
          </tr>
        </thead>
        <tbody id="automationHistories">
          {props.histories.map((row, index) => (
            <tr key={index}>
              <td>{generateName(row)}</td>
              <td>{row.description}</td>
              <td>{dayjs(row.createdAt).format('lll')}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </withTableWrapper.Wrapper>
  );
}
