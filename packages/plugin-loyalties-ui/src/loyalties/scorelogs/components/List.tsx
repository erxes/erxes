import {
  DataWithLoader,
  FormControl,
  Info,
  Pagination,
  Spinner,
  Table,
  __
} from '@erxes/ui/src';
import { Wrapper } from '@erxes/ui/src/layout';
import { IRouterProps } from '@erxes/ui/src/types';
import React from 'react';
import { withRouter, Link } from 'react-router-dom';
import { menuLoyalties } from '../../common/constants';
import Sidebar from '../components/Sidebar';
import { IScoreLogParams } from '../types';
import * as dayjs from 'dayjs';
import ScoreFormContainer from '../containers/Form';
import { Title } from '@erxes/ui/src/styles/main';

interface IProps extends IRouterProps {
  loading: boolean;
  error: any;
  queryParams: any;
  history: any;
  scoreLogs: [IScoreLogParams];
  total: number;
  refetch: (variables: any) => void;
}

class ScoreLogsListComponent extends React.Component<IProps> {
  constructor(props) {
    super(props);
  }

  render() {
    const {
      loading,
      queryParams,
      history,
      scoreLogs,
      total,
      error,
      refetch
    } = this.props;

    const tablehead = [
      'Email',
      'Owner Name',
      'Owner Type',
      'Changed Score',
      'Total Score',
      'Created At'
    ];

    if (loading) {
      return <Spinner />;
    }

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
    const name = (type, owner) => {
      if(!owner){
        return '-'
      }
      switch (type) {
        case 'customer':
          return `${owner?.firstName} ${owner?.lastName}`;
        case 'user':
          return owner?.details?.fullName;
        case 'company':
          return owner?.primaryName 
      }
    }

    const Content = error ? (
      <Info>{error.message}</Info>
    ) : (
      <Table>
        <thead>
          <tr>
            {tablehead.map(p => (
              <th key={p}>{p}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {scoreLogs?.map((p, i) => (
            <tr key={i}>
              <td>
                <Link to={`/${route(p.ownerType)}/details/${p.ownerId}`}>
                  {email(p.ownerType,p.owner)}
                </Link>
              </td>
              <td>{name(p.ownerType,p.owner)}</td>
              <td>{p.ownerType}</td>
              <td>{p.changeScore}</td>
              <td>{p.owner.score}</td>
              <td>{dayjs(p.createdAt).format('lll')}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    );

    const header = (
      <Wrapper.Header title={__('Score') + `(${1})`} submenu={menuLoyalties} />
    );

    const sidebar = (
      <Sidebar
        loadingMainQuery={loading}
        queryParams={queryParams}
        history={history}
        refetch={refetch}
      />
    );

    const content = (
      <>
        <Wrapper.ActionBar
          left={<Title>All Score List</Title>}
          right={<ScoreFormContainer />}
        />
        <DataWithLoader
          data={Content}
          loading={loading}
          count={total}
          emptyText="Empty list"
          emptyImage="/images/actions/1.svg"
        />
      </>
    );

    return <Wrapper header={header} leftSidebar={sidebar} content={content} footer={<Pagination count={total}/>}/>;
  }
}

export default withRouter<IRouterProps>(ScoreLogsListComponent);
