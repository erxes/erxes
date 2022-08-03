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
import Sidebar from '../components/Sidebar';
import * as dayjs from 'dayjs';
import { Title } from '@erxes/ui/src/styles/main';
class FilterDeals extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { checked, deals, loading } = this.props;

    const tablehead = ['Board name', 'Pipeline name', 'Stage Name', 'Amount'];

    if (loading) {
      return <Spinner />;
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
          {deals?.map((p, i) => (
            <tr key={i}>
              <td>
                <Link to={`/${route(p.ownerType)}/details/${p.ownerId}`}>
                  {p.owner.email}
                </Link>
              </td>
              <td>{p.owner.details.fullName}</td>
              <td>{p.ownerType}</td>
              <td>{p.changeScore}</td>
              <td>{p.owner.score}</td>
              <td>{dayjs(p.createdAt).format('lll')}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    );

    const header = <Wrapper.Header title={__('Check deals') + `(${1})`} />;

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
          left={<Title>Deals</Title>}
          //   right={<ScoreFormContainer />}
        />
        <DataWithLoader
          data={Content}
          loading={loading}
          //   count={total}
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
        // footer={<Pagination count={total}/>}
      />
    );
  }
}
export default FilterDeals;
