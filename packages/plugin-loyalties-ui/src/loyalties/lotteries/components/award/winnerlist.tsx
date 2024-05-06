import { Button, Table } from '@erxes/ui/src';
import React from 'react';
import { TableContainer } from '../../../../styles';
import { ILottery } from '../../types';
interface IProps {
  lists: ILottery[];
}

class WinnersAwardList extends React.Component<IProps> {
  constructor(props) {
    super(props);
  }

  render() {
    const { lists } = this.props;

    return (
      <TableContainer>
        <Table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {lists.map((list, i) => (
              <tr>
                <td>{list?.owner.email}</td>
                <td>
                  <Button btnStyle="white" icon="ellipsis-h" />
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </TableContainer>
    );
  }
}

export default WinnersAwardList;
