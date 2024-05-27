import React from 'react';
import Table from '@erxes/ui/src/components/table';
import { __ } from '@erxes/ui/src/utils';
import Item from '../containers/Item';
type Props = {
  type: any;
  data: any;
  refetch: () => void;
};
type State = {};

class List extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
  }

  render() {
    const { data, refetch } = this.props;

    const itemList = data.map(item => {
      return <Item item={item} refetch={refetch} />;
    });

    return (
      <>
        <Table>
          <thead>
            <tr>
              <th>{__('Name')}</th>
              <th>{__('type')}</th>
              <th>{__('Actions')}</th>
              <th style={{ width: 80 }} />
            </tr>
          </thead>
          <tbody>{itemList}</tbody>
        </Table>
      </>
    );
  }
}

export default List;
