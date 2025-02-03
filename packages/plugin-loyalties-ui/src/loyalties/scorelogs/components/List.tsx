import {
  Button,
  DataWithLoader,
  Icon,
  ModalTrigger,
  Pagination,
  Table,
  __,
} from '@erxes/ui/src';

import { Title } from '@erxes/ui-settings/src/styles';
import { Wrapper } from '@erxes/ui/src/layout';
import { SimpleButton } from '@erxes/ui/src/styles/main';
import React, { useState } from 'react';
import { menuLoyalties } from '../../common/constants';
import Sidebar from '../components/Sidebar';
import Form from '../containers/Form';
import { IScoreLogParams } from '../types';
import Row from './Row';
import Statistics from './Statistics';

type Props = {
  loading: boolean;
  queryParams: any;
  scoreLogs: IScoreLogParams[];
  statistics: any;
  total: number;
  refetch: (variables: any) => void;
};

const tablehead = [
  'Owner Name',
  'Email',
  'Phone',
  'Owner Type',
  'Total Score',
  'Actions',
];

const ScoreLogsListComponent = (props: Props) => {
  const { loading, queryParams, scoreLogs, statistics, total, refetch } = props;

  const [toggleSidebar, setToggleSidebar] = useState<boolean>(false);

  const modalContent = (props) => <Form {...props} />;

  const renderForm = () => {
    const trigger = <Button btnStyle="success">{__('Give Score')}</Button>;

    return (
      <ModalTrigger
        title="Add Score"
        trigger={trigger}
        autoOpenKey="showVoucherModal"
        content={modalContent}
        backDrop="static"
      />
    );
  };

  const header = (
    <Wrapper.Header
      title={__('Score') + `(${total})`}
      submenu={menuLoyalties}
    />
  );

  const actionBar = (
    <Wrapper.ActionBar
      right={renderForm()}
      left={
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <SimpleButton
            id="btn-inbox-channel-visible"
            $isActive={toggleSidebar}
            onClick={() => setToggleSidebar(!toggleSidebar)}
          >
            <Icon icon="subject" />
          </SimpleButton>
          <Title>{`All Score List (${total})`}</Title>
        </div>
      }
    />
  );

  const sideBar = (
    <Sidebar
      loadingMainQuery={loading}
      queryParams={queryParams}
      refetch={refetch}
      toggleSidebar={toggleSidebar}
    />
  );

  const content = (
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
          <Row key={i} scoreLog={p} headers={tablehead} />
        ))}
      </tbody>
    </Table>
  );

  return (
    <Wrapper
      header={header}
      leftSidebar={sideBar}
      actionBar={actionBar}
      mainHead={<Statistics statistics={statistics} />}
      content={
        <DataWithLoader
          data={content}
          loading={loading}
          count={total}
          emptyText="Empty list"
          emptyImage="/images/actions/1.svg"
        />
      }
      footer={<Pagination count={total} />}
      hasBorder
    />
  );
};

export default ScoreLogsListComponent;
