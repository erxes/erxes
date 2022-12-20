import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
import FormControl from '@erxes/ui/src/components/form/Control';
import Pagination from '@erxes/ui/src/components/pagination/Pagination';
import React from 'react';
import Row from './PerformRow';
import Table from '@erxes/ui/src/components/table';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { __, router } from '@erxes/ui/src/utils';
import {
  BarItems,
  FieldStyle,
  SidebarCounter
} from '@erxes/ui/src/layout/styles';
import { Count } from '@erxes/ui/src/styles/main';
import { IPerform } from '../../overallWork/types';
import { IRouterProps } from '@erxes/ui/src/types';
import { menuNavs } from '../../constants';

interface IProps extends IRouterProps {
  history: any;
  queryParams: any;
  performs: IPerform[];
  performsCount: number;
  loading: boolean;
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
        <SidebarCounter>{(products || []).length}</SidebarCounter>
      </li>
    );

    for (const product of products) {
      const { quantity, uom } = product;
      const productName = product.product ? product.product.name : 'not name';
      const uomCode = uom ? uom.code : 'not uom';

      result.push(this.renderView(productName, quantity + '/' + uomCode + '/'));
    }

    return result;
  };

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

  render() {
    const { performsCount, loading } = this.props;

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
      </>
    );

    //

    return (
      <Wrapper
        header={<Wrapper.Header title={__('Work')} submenu={menuNavs} />}
        actionBar={<Wrapper.ActionBar right={actionBarRight} />}
        footer={<Pagination count={performsCount || 0} />}
        content={
          <DataWithLoader
            data={content}
            loading={loading}
            count={performsCount || 0}
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
