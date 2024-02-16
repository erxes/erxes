import { ILog } from '../../types';
import Row from './Row';
import { __ } from '@erxes/ui/src/utils';
import React from 'react';
import { Title } from '@erxes/ui-settings/src/styles';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import Table from '@erxes/ui/src/components/table';
import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import FormControl from '@erxes/ui/src/components/form/Control';
type Props = {
  logs: ILog[];
  id: string;
  loading: boolean;
};

function List({ logs, id, loading }: Props) {
  const actionBarRight = (
    <FormControl type="text" placeholder={__('Type to search')} />
  );
  const title = <Title capitalize={true}>{__('ZMS')}</Title>;
  const actionBar = (
    <Wrapper.ActionBar left={title} right={actionBarRight} wideSpacing />
  );
  const content = (
    <Table>
      <thead>
        <tr>
          <th></th>
          <th>{__('sent date')}</th>
          <th>{__('status')}</th>
          <th>{__('action')}</th>
          <th>{__('loan')}</th>
        </tr>
      </thead>
      <tbody id={'ZmssShowing'}>
        {logs.map((log) => {
          return <Row space={0} key={log._id} log={log} />;
        })}
      </tbody>
    </Table>
  );

  const SideBarList = asyncComponent(
    () =>
      import(
        /* webpackChunkName: "List - Zmss" */ '../../containers/zms/SideBarList'
      ),
  );
  return (
    <Wrapper
      header={
        <Wrapper.Header
          title={__('Zms')}
          submenu={[
            { title: 'Zms', link: '/plugin-zms/zms' },
            { title: 'Dictionary', link: '/plugin-zms/dictionary' },
          ]}
        />
      }
      actionBar={actionBar}
      content={
        <DataWithLoader
          data={content}
          loading={loading}
          count={logs.length}
          emptyText={__('Theres no zms')}
          emptyImage="/images/actions/8.svg"
        />
      }
      leftSidebar={<SideBarList id={id} />}
      transparent={true}
      hasBorder
    />
  );
}

export default List;
