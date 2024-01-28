import Table from '@erxes/ui/src/components/table';
import { __ } from '@erxes/ui/src/utils';
import React from 'react';
import Row from './Row';

type Props = {
  list: any[];
  totalCount: number;
  remove: (_id: string) => void;
};

class List extends React.Component<Props> {
  render() {
    const { list, remove } = this.props;

    return (
      <Table>
        <thead>
          <tr>
            <th>{__('Name')}</th>
            <th>{__('Account')}</th>
            <th>{__('Page')}</th>
            <th>{__('Actions')}</th>
          </tr>
        </thead>

        <tbody>
          {list.map((bot) => (
            <Row key={bot._id} bot={bot} remove={remove} />
          ))}
        </tbody>
      </Table>
    );
  }
}

export default List;
