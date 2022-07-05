import React from 'react';

import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
import Pagination from '@erxes/ui/src/components/pagination/Pagination';
import Table from '@erxes/ui/src/components/table';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import {
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
import ProgressBar from '@erxes/ui/src/components/ProgressBar';
import Button from '@erxes/ui/src/components/Button';
import Form from '../../containers/PerformForm';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';

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
  overallWorkId: string;
  max: number;
};

class List extends React.Component<IProps, State> {
  private timer?: NodeJS.Timer;

  constructor(props) {
    super(props);

    const { queryParams } = this.props;
    const { overallWorkId } = queryParams;

    const percentageObject = this.calculatePercent();

    this.state = {
      searchValue: this.props.searchValue,
      overallWorkPercent: percentageObject.percent,
      overallWorkId: overallWorkId || '',
      max: percentageObject.max
    };
  }

  componentDidUpdate() {
    const percentageObject = this.calculatePercent();
    const { overallWorkPercent, max } = this.state;
    if (
      percentageObject.percent !== overallWorkPercent &&
      percentageObject.max !== max
    ) {
      this.setState({
        overallWorkPercent: percentageObject.percent,
        max: percentageObject.max
      });
    }
  }

  calculatePercent = () => {
    const { overallWorkDetail, performs } = this.props;
    const { resultProductsDetail } = overallWorkDetail;

    console.log('performs', performs);

    const productId = performs.length > 0 ? performs[0].productId : null;
    const performsByProductId = productId
      ? performs.filter(p => p.productId === productId)
      : [];
    const totalCountList = performsByProductId.map(e => e.count) || [];
    let total = 0;
    for (const count of totalCountList) {
      total = total + Number(count);
    }
    const resultProduct = productId
      ? resultProductsDetail.find(re => re.product._id === productId)
      : resultProductsDetail[0];

    return {
      percent: Math.round(
        total !== 0 ? (total * 100) / Number(resultProduct.quantity) : 0
      ),
      max: Number(resultProduct.quantity) - total
    };
  };

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
        <SidebarCounter>{(products || []).length}</SidebarCounter>
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
        {this.renderProducts('NeedProducts', needProductsDetail || [])}
      </SidebarList>
    );
  }

  renderDetailResult() {
    const { overallWorkDetail } = this.props;
    const { resultProductsDetail } = overallWorkDetail;

    return (
      <SidebarList className="no-link">
        {this.renderProducts('ResultProducts', resultProductsDetail || [])}
      </SidebarList>
    );
  }

  renderRow = () => {
    const { performs, history } = this.props;
    return (performs || []).map(perform => (
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

  renderAboveSide = () => {
    const { overallWorkPercent, overallWorkId } = this.state;
    if (overallWorkId) {
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
    } else {
      return null;
    }
  };

  overallWorkIdGetter = (overallWorkId: string) => {
    this.setState({ overallWorkId });
  };

  render() {
    const { performsCount, loading, queryParams, history } = this.props;
    const { overallWorkId, max } = this.state;

    const trigger = (
      <Button btnStyle="success" icon="plus-circle">
        Add performance
      </Button>
    );

    // const actionBarRight = (
    //   <BarItems>
    //     <FormControl
    //       type="text"
    //       placeholder={__('Type to search')}
    //       onChange={this.search}
    //       value={this.state.searchValue}
    //       autoFocus={true}
    //       onFocus={this.moveCursorAtTheEnd}
    //     />
    //   </BarItems>
    // );

    const modalContent = props => (
      <Form
        {...props}
        overallWorkDetail={this.props.overallWorkDetail}
        max={max}
      />
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

        {overallWorkId && (
          <ModalTrigger
            title="Add performance"
            trigger={trigger}
            autoOpenKey="showPerformanceModal"
            content={modalContent}
          />
        )}
        {/* <Button> Add overallWork </Button> */}
      </>
    );

    // <Wrapper.ActionBar right={actionBarRight} />

    return (
      <Wrapper
        header={<Wrapper.Header title={__('Work')} submenu={menuContacts1} />}
        actionBar={this.renderAboveSide()}
        leftSidebar={
          <OverallWorkSideBar
            queryParams={queryParams}
            history={history}
            overallWorkIdgetter={this.overallWorkIdGetter}
          />
        }
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
