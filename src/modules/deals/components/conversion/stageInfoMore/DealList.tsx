import { Table } from 'modules/common/components';
import { __ } from 'modules/common/utils';
import { IDeal } from 'modules/deals/types';
import * as React from 'react';
import DealItem from './DealItem';

type Props = {
  listId: string;
  listType?: string;
  stageId: string;
  deals: IDeal[];
};

export default class DealList extends React.Component<Props> {
  static defaultProps = {
    listId: 'LIST'
  };

  render() {
    const { deals } = this.props;
    const contents = deals.map((deal, index) => (
      <DealItem key={index} deal={deal} />
    ));

    return (
      <tr>
        <td colSpan={4}>
          <Table>
            <thead>
              <tr>
                <th>{__('Deal')}</th>
                <th>{__('Value')}</th>
                <th>{__('Current Stage')}</th>
                <th>{__('Assigned')}</th>
              </tr>
            </thead>
            <tbody>{contents}</tbody>
          </Table>
        </td>
      </tr>
    );
  }
}
