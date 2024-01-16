import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
import { IOverallWork } from '../types';
import { IRouterProps } from '@erxes/ui/src/types';
import Pagination from '@erxes/ui/src/components/pagination/Pagination';
import React from 'react';
import Row from './Row';
import Sidebar from './Sidebar';
import Table from '@erxes/ui/src/components/table';
import { TableWrapper } from '../../styles';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { __ } from 'coreui/utils';
// import { withRouter } from 'react-router-dom';
import { menuNavs } from '../../constants';

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
              <th>{__('Spend Branch')}</th>
              <th>{__('Spend Department')}</th>
              <th>{__('Receipt Branch')}</th>
              <th>{__('Receipt Department')}</th>
              <th>{__('Actions')}</th>
            </tr>
          </thead>
          <tbody id="overallWorks">
            {(overallWorks || []).map((work) => (
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

export default OverallWorks;
