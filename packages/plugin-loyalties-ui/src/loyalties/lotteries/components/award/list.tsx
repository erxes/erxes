import { Table } from '@erxes/ui/src/';
import { colors } from '@erxes/ui/src/styles/';
import { IRouterProps } from '@erxes/ui/src/types';
import React from 'react';
import { Link, withRouter } from 'react-router-dom';
import { Badge, TableContainer } from '../../../../styles';
import { ILottery } from '../../types';

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
    const { lotteries } = this.props;

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

    const route = type => {
      switch (type) {
        case 'customer':
          return 'contacts';
        case 'user':
          return 'settings/team';
        case 'company':
          return 'companies';
      }
    };

    const email = (type, owner) => {
      if (!owner) {
        return '-';
      }
      switch (type) {
        case 'customer':
          return owner?.primaryEmail;
        case 'user':
          return owner?.email;
        case 'company':
          return owner?.primaryEmail ? owner?.primaryEmail : owner?.primaryName;
      }
    };

    return (
      <>
        <TableContainer>
          <Table>
            <thead>
              <tr>
                <th>Email</th>
                <th>Owner Type</th>
                <th>Number</th>
                <th style={{ textAlign: 'left' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {lotteries?.map((lottery, i) => (
                <tr key={i}>
                  <td>
                    <Link to={`/${route(lottery.ownerType)}/details/${lottery.ownerId}`}>{email(lottery.ownerType, lottery.owner)}</Link>
                  </td>

                  <td>{lottery?.ownerType}</td>

                  <td>{lottery?.number}</td>
                  <td>{status(lottery?.status)}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </TableContainer>
      </>
    );
  }
}

export default withRouter<IRouterProps>(AwardList);
