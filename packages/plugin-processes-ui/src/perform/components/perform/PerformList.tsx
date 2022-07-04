import React from 'react';

import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
import FormControl from '@erxes/ui/src/components/form/Control';
import Pagination from '@erxes/ui/src/components/pagination/Pagination';
import Table from '@erxes/ui/src/components/table';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import {
  BarItems,
  FieldStyle,
  SidebarCounter,
  SidebarList
} from '@erxes/ui/src/layout/styles';
import { Count, FormColumn, FormWrapper } from '@erxes/ui/src/styles/main';
import { IRouterProps } from '@erxes/ui/src/types';
import { __, router } from '@erxes/ui/src/utils';

import { menuContacts1 } from '../../../constants';
import { IOverallWorkDocument, IPerformDocument } from '../../types';
import Row from './PerformRow';
import OverallWorkSideBar from '../../containers/OverallWorkSideBar';
import OverallWorkSideBarDetail from '../../containers/OverallWorkSideBarDetail';
import ProgressBar from '@erxes/ui/src/components/ProgressBar';
import Button from '@erxes/ui/src/components/Button';

interface IProps extends IRouterProps {
  history: any;
  queryParams: any;
  performs: IPerformDocument[];
  performsCount: number;
  loading: boolean;
  overallWorkDetail: IOverallWorkDocument;
  searchValue: string;
}

type State = {
  searchValue?: string;
  overallWorkPercent: number;
};

class List extends React.Component<IProps, State> {
  private timer?: NodeJS.Timer;

  constructor(props) {
    super(props);

    this.state = {
      searchValue: this.props.searchValue,
      overallWorkPercent: 0
    };
  }

  renderView = (name: string, variable: string) => {
    const defaultName = '-';

    return (
      <li>
        <FieldStyle>{__(name)}</FieldStyle>
        <SidebarCounter>{variable || defaultName}</SidebarCounter>
      </li>
    );
  };

  renderProducts = (name: string, products: any[]) => {
    const result: React.ReactNode[] = [];

    result.push(
      <li>
        <FieldStyle>{__(name)}</FieldStyle>
        <SidebarCounter>{products.length}</SidebarCounter>
      </li>
    );

    for (const product of products) {
      const { quantity, uom } = product;
      const productName = product.product ? product.product.name : 'not noe';
      const uomCode = uom ? uom.code : 'not uom';

      result.push(this.renderView(productName, quantity + '/' + uomCode + '/'));
    }

    return result;
  };

  renderDetailGeneral() {
    const { overallWorkDetail } = this.props;
    const {
      job,
      flow,
      interval,
      intervalId,
      outBranch,
      outDepartment,
      inBranch,
      inDepartment
    } = overallWorkDetail;

    return (
      <SidebarList className="no-link">
        {this.renderView('Flow', flow ? flow.name : '')}
        {this.renderView('Job', job ? job.label : '')}
        {this.renderView('Interval', interval ? interval.name : intervalId)}
        {this.renderView('InBranch', inBranch || '')}
        {this.renderView('inDepartment', inDepartment || '')}
        {this.renderView('outBranch', outBranch || '')}
        {this.renderView('outDepartment', outDepartment || '')}
      </SidebarList>
    );
  }

  renderDetailNeed() {
    const { overallWorkDetail } = this.props;
    const { needProductsDetail } = overallWorkDetail;

    return (
      <SidebarList className="no-link">
        {this.renderProducts('NeedProducts', needProductsDetail)}
      </SidebarList>
    );
  }

  renderDetailResult() {
    const { overallWorkDetail } = this.props;
    const { resultProductsDetail } = overallWorkDetail;

    return (
      <SidebarList className="no-link">
        {this.renderProducts('ResultProducts', resultProductsDetail)}
      </SidebarList>
    );
  }

  renderRow = () => {
    const { performs, history } = this.props;
    return performs.map(perform => (
      <Row history={history} key={perform._id} perform={perform} />
    ));
  };

  renderCount = performsCount => {
    return (
      <Count>
        {performsCount} work{performsCount > 1 && 's'}
      </Count>
    );
  };

  search = e => {
    if (this.timer) {
      clearTimeout(this.timer);
    }

    const { history } = this.props;
    const searchValue = e.target.value;

    this.setState({ searchValue });

    this.timer = setTimeout(() => {
      router.removeParams(history, 'page');
      router.setParams(history, { searchValue });
    }, 500);
  };

  moveCursorAtTheEnd(e) {
    const tmpValue = e.target.value;

    e.target.value = '';
    e.target.value = tmpValue;
  }

  renderLeftDetail() {
    const { queryParams } = this.props;
    const overallWorkId = queryParams.overallWorkId || null;

    if (overallWorkId) {
      return (
        <OverallWorkSideBarDetail queryParams={queryParams} history={history} />
      );
    } else {
      return null;
    }
  }

  renderAboveSide = () => {
    const { overallWorkPercent } = this.state;
    return (
      <>
        <FormWrapper>
          <FormColumn>{this.renderDetailGeneral()}</FormColumn>
          <FormColumn>{this.renderDetailNeed()}</FormColumn>
          <FormColumn>{this.renderDetailResult()}</FormColumn>
        </FormWrapper>
        <ProgressBar percentage={overallWorkPercent} height="20px">
          {overallWorkPercent}%
        </ProgressBar>
      </>
    );
  };

  render() {
    const { performsCount, loading, queryParams, history } = this.props;

    const actionBarRight = (
      <BarItems>
        <FormControl
          type="text"
          placeholder={__('Type to search')}
          onChange={this.search}
          value={this.state.searchValue}
          autoFocus={true}
          onFocus={this.moveCursorAtTheEnd}
        />
      </BarItems>
    );

    const content = (
      <>
        {this.renderCount(performsCount || 0)}
        <Table hover={true}>
          <thead>
            <tr>
              <th>{__('OverallWork')}</th>
              <th>{__('Status')}</th>
              <th>{__('Count')}</th>
              <th>{__('Need products')}</th>
              <th>{__('Result products')}</th>
              <th>{__('StartAt')}</th>
            </tr>
          </thead>
          <tbody>{this.renderRow()}</tbody>
        </Table>

        <Button> Add overallWork </Button>
      </>
    );

    // <Wrapper.ActionBar right={actionBarRight} />

    return (
      <Wrapper
        header={<Wrapper.Header title={__('Work')} submenu={menuContacts1} />}
        actionBar={this.renderAboveSide()}
        leftSidebar={
          <OverallWorkSideBar queryParams={queryParams} history={history} />
        }
        // rightSidebar={this.renderLeftDetail()}
        footer={<Pagination count={performsCount || 0} />}
        content={
          <DataWithLoader
            data={content}
            loading={loading}
            count={1}
            emptyText="There is no data"
            emptyImage="/images/actions/5.svg"
          />
        }
        hasBorder={true}
        transparent={true}
      />
    );
  }
}

export default List;
