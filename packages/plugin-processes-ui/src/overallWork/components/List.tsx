import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
import Pagination from '@erxes/ui/src/components/pagination/Pagination';
import Table from '@erxes/ui/src/components/table';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { IRouterProps } from '@erxes/ui/src/types';
import { __ } from 'coreui/utils';
import React from 'react';
import { withRouter } from 'react-router-dom';
import { menuNavs } from '../../constants';
import { TableWrapper } from '../../styles';
import { IOverallWork } from '../types';
import Row from './Row';
import Sidebar from './Sidebar';

interface IProps extends IRouterProps {
  overallWorks: IOverallWork[];
  totalCount: number;
  history: any;
  queryParams: any;
}

class OverallWorks extends React.Component<IProps, {}> {
  constructor(props) {
    super(props);
  }

  render() {
    const { overallWorks, totalCount, history, queryParams } = this.props;

    const mainContent = (
      <TableWrapper>
        <Table whiteSpace="nowrap" bordered={true} hover={true}>
          <thead>
            <tr>
              <th>{__('Type')}</th>
              <th>{__('Job')}</th>
              <th>{__('Product')}</th>
              <th>{__('Count')}</th>
              <th>{__('In Branch')}</th>
              <th>{__('In Department')}</th>
              <th>{__('Out Branch')}</th>
              <th>{__('Out Department')}</th>
              <th>{__('Actions')}</th>
            </tr>
          </thead>
          <tbody id="overallWorks">
            {(overallWorks || []).map(work => (
              <Row
                key={Math.random()}
                work={work}
                history={history}
                queryParams={queryParams}
              />
            ))}
          </tbody>
        </Table>
      </TableWrapper>
    );

    return (
      <Wrapper
        header={
          <Wrapper.Header title={__(`Overall works`)} submenu={menuNavs} />
        }
        leftSidebar={<Sidebar queryParams={queryParams} history={history} />}
        footer={<Pagination count={totalCount} />}
        content={
          <DataWithLoader
            data={mainContent}
            loading={false}
            count={totalCount}
            emptyText="Add in your first work!"
            emptyImage="/images/actions/1.svg"
          />
        }
      />
    );
  }
}

export default withRouter<IRouterProps>(OverallWorks);
