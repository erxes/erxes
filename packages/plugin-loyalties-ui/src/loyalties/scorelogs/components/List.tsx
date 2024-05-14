import * as dayjs from 'dayjs';

import {
  DataWithLoader,
  FormControl,
  Info,
  Pagination,
  Spinner,
  Table,
  __,
} from '@erxes/ui/src';

import { IScoreLogParams } from '../types';
import { Link } from 'react-router-dom';
import React from 'react';
import ScoreFormContainer from '../containers/Form';
import Sidebar from '../components/Sidebar';
import { Title } from '@erxes/ui/src/styles/main';
import { Wrapper } from '@erxes/ui/src/layout';
import { menuLoyalties } from '../../common/constants';

interface IProps  {
  loading: boolean;
  error: any;
  queryParams: any;
  scoreLogs: [IScoreLogParams];
  total: number;
  refetch: (variables: any) => void;
}

class ScoreLogsListComponent extends React.Component<IProps> {
  constructor(props) {
    super(props);
  }

  render() {
    const { loading, queryParams, scoreLogs, total, error, refetch } =
      this.props;

    const tablehead = [
      'Email',
      'Owner Name',
      'Owner Type',
      'Changed Score',
      'Total Score',
      'Created At',
    ];

    if (loading) {
      return <Spinner />;
    }

    const route = (type) => {
      switch (type) {
        case 'customer':
          return 'contacts';
        case 'user':
          return 'settings/team';
        case 'company':
          return 'companies';
        case 'cpUser':
          return 'settings/client-portal/users';
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
        case 'cpUser':
          return owner?.email || '-';
      }
    };
    const name = (type, owner) => {
      if (!owner) {
        return '-';
      }
      switch (type) {
        case 'customer':
          return `${owner?.firstName} ${owner?.lastName}`;
        case 'user':
          return owner?.details?.fullName;
        case 'company':
          return owner?.primaryName;
        case 'cpUser':
          return owner?.username || (owner?.firstName && owner?.lastName)
            ? `${owner?.firstName} ${owner.lastName}`
            : '-';
      }
    };

    const Content = error ? (
      <Info>{error.message}</Info>
    ) : (
      <Table>
        <thead>
          <tr>
            {tablehead.map((p) => (
              <th key={p}>{p}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {scoreLogs?.map((p, i) => (
            <tr key={i}>
              <td>
                <Link to={`/${route(p.ownerType)}/details/${p.ownerId}`}>
                  {email(p.ownerType, p.owner)}
                </Link>
              </td>
              <td>{name(p.ownerType, p.owner)}</td>
              <td>{p.ownerType}</td>
              <td>{p.changeScore}</td>
              <td>{p.owner?.score}</td>
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

    return (
      <Wrapper
        header={header}
        leftSidebar={sidebar}
        content={content}
        footer={<Pagination count={total} />}
        hasBorder
      />
    );
  }
}

export default ScoreLogsListComponent;
