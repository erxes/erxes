import React from 'react';

import { __ } from '@erxes/ui/src/utils';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import EditForm from '../containers/EditForm';
import AddForm from '../containers/AddForm';
import { IExm } from '../types';
import { Pagination, Table } from '@erxes/ui/src/components';
import SideBar from './SideBar';

type Props = {
  queryParams: any;
  history: any;
  list?: IExm[];
  totalCount: number;
};

function Home(props: Props) {
  const { list, totalCount, queryParams, history } = props;

  const leftActionBar = <div>{exm ? exm.name : ''}</div>;

  const content = () => {
    return (
      <div>
        <Table>
          <thead>
            <tr>
              <th>{__('Name')}</th>
              <th>{__('Actions')}</th>
            </tr>
          </thead>
          {/* <tbody>{list.map(item => this.renderRow(item, item._id))}</tbody> */}
        </Table>
      </div>
    );
  };

  return (
    <Wrapper
      header={
        <Wrapper.Header
          title={'Exm core'}
          breadcrumb={[{ title: 'Exm core' }]}
        />
      }
      actionBar={<Wrapper.ActionBar left={leftActionBar} />}
      leftSidebar={<SideBar history={history} queryParams={queryParams} />}
      content={content()}
      footer={<Pagination count={totalCount} />}
    />
  );
}

export default Home;
