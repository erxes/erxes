import { Pagination, Table } from '@erxes/ui/src/components';
import React from 'react';
import { IMeeting } from '../../types';
import { Row } from './Row';

type Props = {
  meetings: IMeeting[];
  remove: (id: string) => void;
  count: number;
};

export const ListComponent = (props: Props) => {
  const { meetings, remove, count } = props;

  return (
    <>
      <Table>
        <thead>
          <tr>
            <th>{'Meeting name'}</th>
            <th>{'Saved By'}</th>
            <th>{'Saved At'}</th>
            <th>{'Members'}</th>
            <th>{'Status'}</th>
            <th>
              <>{'Action'}</>
            </th>
          </tr>
        </thead>
        <tbody>
          {meetings?.map((meeting: IMeeting, index: number) => {
            return (
              <Row
                meeting={meeting}
                key={index}
                remove={() => remove(meeting._id)}
              />
            );
          })}
        </tbody>
      </Table>
      <Pagination count={count || 0} />
    </>
  );
};
