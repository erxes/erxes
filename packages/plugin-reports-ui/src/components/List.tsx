import { Title } from '@erxes/ui-settings/src/styles';
import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import Button from '@erxes/ui/src/components/Button';
import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
import Table from '@erxes/ui/src/components/table';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import { __ } from '@erxes/ui/src/utils';
import React from 'react';
import { DragField } from '../styles';
import { IReports } from '../types';
import Chart, { ChartType } from './chart/Chart';
import FunnelChart from './chart/FunnelChart';
import LineChart from './chart/LineChart';

type Props = {
  reports: any;
  renderButton?: (props: IButtonMutateProps) => JSX.Element;
  remove?: (reports: IReports) => void;
  edit?: (reports: IReports) => void;
  loading: boolean;
};

function List({ reports, remove, renderButton, loading, edit }: Props) {
  const trigger = (
    <Button id={'AddReportsButton'} btnStyle="success" icon="plus-circle">
      Add Reports
    </Button>
  );

  // const modalContent = props => (
  //   <Form
  //     {...props}
  //     types={types}
  //     renderButton={renderButton}
  //     reports={reports}
  //   />
  // );

  // const actionBarRight = (
  //   <ModalTrigger
  //     title={__('Add reports')}
  //     trigger={trigger}
  //     content={modalContent}
  //     enforceFocus={false}
  //   />
  // );

  const title = <Title capitalize={true}>{__('Reports')}</Title>;

  const actionBar = <Wrapper.ActionBar left={title} wideSpacing />;

  const content = (
    <Table>
      <thead>
        <tr>
          <th>{__('Todo')}</th>
          <th>{__('Expiry Date')}</th>
          <th>{__('Actions')}</th>
        </tr>
      </thead>
      <tbody id={'ReportsShowing'}>
        {/* {reports.map(reports => {
          return (
            <Row
              space={0}
              key={reports._id}
              reports={reports}
              remove={remove}
              edit={edit}
              renderButton={renderButton}
              reports={reports}
              types={types}
            />
          );
        })} */}
      </tbody>
    </Table>
  );

  const SideBarList = asyncComponent(() =>
    import(/* webpackChunkName: "List - Reports" */ '../containers/SideBarList')
  );

  const breadcrumb = [
    { title: __('Settings'), link: '/settings' },
    { title: __('Reports'), link: '/reports' }
  ];

  const defaultLayout = i => ({
    x: i?.layout.x || 0,
    y: i?.layout.y || 0,
    w: i?.layout.w || 3,
    h: i?.layout.h || 3,
    minW: 1,
    minH: 1
  });

  // return (
  //   <GridLayout className="layout" cols={12} rowHeight={30} width={1200}>
  //     <div key="a" data-grid={{ x: 0, y: 0, w: 1, h: 2, static: true }}>
  //       a
  //     </div>
  //     <div key="b" data-grid={{ x: 1, y: 0, w: 3, h: 2, minW: 2, maxW: 4 }}>
  //       b
  //     </div>
  //     <div key="c" data-grid={{ x: 4, y: 0, w: 1, h: 2 }}>
  //       c
  //     </div>
  //   </GridLayout>
  // );

  // return (

  return (
    <DragField>
      <div
        key={Math.random()}
        data-grid={{
          x: 0,
          y: 0,
          w: 3,
          h: 3,
          minW: 1,
          minH: 1
        }}
      >
        <LineChart />
        {/* <div>hahahha</div> */}
      </div>

      <div
        key={Math.random()}
        data-grid={{
          x: 0,
          y: 0,
          w: 3,
          h: 3,
          minW: 1,
          minH: 1
        }}
      >
        <FunnelChart
          data={{
            title: 'Funnel chart',
            labels: ['a', 'b', 'c'],
            values: [
              [0, 10],
              [2, 8],
              [4, 6]
            ]
          }}
        />
      </div>

      <div
        key={Math.random()}
        data-grid={{
          x: 0,
          y: 0,
          w: 3,
          h: 3,
          minW: 1,
          minH: 1
        }}
      >
        <Chart
          data={[1, 2, 3, 4, 5, 6]}
          labels={['a', 'b', 'c', 'd', 'e', 'f']}
          chartType={ChartType.BAR}
          name="Bar Chart"
        />
      </div>
    </DragField>
  );

  return (
    <Wrapper
      header={<Wrapper.Header title={__('Reports')} breadcrumb={breadcrumb} />}
      actionBar={actionBar}
      content={
        <DataWithLoader
          data={content}
          loading={loading}
          count={reports.length}
          emptyText={__('Theres no reports')}
          emptyImage="/images/actions/8.svg"
        />
      }
      transparent={true}
      leftSidebar={<SideBarList />}
      hasBorder
    />
  );
}

export default List;
