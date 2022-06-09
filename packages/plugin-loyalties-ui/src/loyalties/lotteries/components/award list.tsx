import { Button, Table } from '@erxes/ui/src/';
import { colors } from '@erxes/ui/src/styles/';
import { IRouterProps } from '@erxes/ui/src/types';
import React from 'react';
import { withRouter } from 'react-router-dom';
import { Badge, TableContainer } from '../../../styles';
import { ILottery } from '../types';

interface IProps extends IRouterProps {
  lotteries: ILottery[];
  loading: boolean;
  totalCount: number;
  isWinnerList: boolean;
}

class AwardList extends React.Component<IProps> {
  constructor(props) {
    super(props);
  }

  render() {
    const { lotteries, totalCount } = this.props;

    const status = value => {
      switch (value) {
        case 'new':
          return <Badge color={colors.linkPrimary}>{value}</Badge>;
        case 'won':
          return <Badge color={colors.colorCoreGreen}>{value}</Badge>;
        case 'lost':
          return <Badge color={colors.colorCoreRed}>{value}</Badge>;
        default:
          break;
      }
    };

    return (
      <TableContainer>
        <Table>
          <thead>
            <tr>
              <th>Email</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {lotteries?.map((lottery, i) => (
              <tr key={i}>
                <td> {lottery.owner.email}</td>
                <td>{status(lottery.status)}</td>
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

export default withRouter<IRouterProps>(AwardList);
