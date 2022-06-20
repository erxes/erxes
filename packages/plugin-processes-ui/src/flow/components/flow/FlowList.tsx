import Button from '@erxes/ui/src/components/Button';
import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
import EmptyState from '@erxes/ui/src/components/EmptyState';
import FormControl from '@erxes/ui/src/components/form/Control';
import Pagination from '@erxes/ui/src/components/pagination/Pagination';
import Table from '@erxes/ui/src/components/table';
import { Count, Title } from '@erxes/ui/src/styles/main';
import { IRouterProps } from '@erxes/ui/src/types';
import { __, Alert, confirm, router } from '@erxes/ui/src/utils';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { BarItems } from '@erxes/ui/src/layout/styles';
import React from 'react';
import CategoryList from '../../containers/flowCategory/CategoryList';
import { IProductCategory, IFlowDocument } from '../../types';
import Row from './FlowListRow';
import { menuContacts } from '../../../constants';

interface IProps extends IRouterProps {
  history: any;
  queryParams: any;
  flows: IFlowDocument[];
  flowsTotalCount: number;
  isAllSelected: boolean;
  bulk: any[];
  emptyBulk: () => void;
  remove: (doc: { flowIds: string[] }, emptyBulk: () => void) => void;
  addFlow: () => void;
  toggleBulk: () => void;
  toggleAll: (targets: IFlowDocument[], containerId: string) => void;
  loading: boolean;
  searchValue: string;
  currentCategory: IProductCategory;
}

type State = {
  searchValue?: string;
};

class List extends React.Component<IProps, State> {
  private timer?: NodeJS.Timer;

  constructor(props) {
    super(props);

    this.state = {
      searchValue: this.props.searchValue
    };
  }

  renderRow = () => {
    const { flows, history, toggleBulk, bulk } = this.props;

    return flows.map(flow => (
      <Row
        history={history}
        key={flow._id}
        flow={flow}
        toggleBulk={toggleBulk}
        isChecked={bulk.includes(flow)}
      />
    ));
  };

  onChange = () => {
    const { toggleAll, flows } = this.props;
    toggleAll(flows, 'flows');
  };

  removeProducts = flows => {
    const flowIds: string[] = [];

    flows.forEach(jobRefer => {
      flowIds.push(jobRefer._id);
    });

    this.props.remove({ flowIds }, this.props.emptyBulk);
  };

  renderCount = flowCount => {
    return (
      <Count>
        {flowCount} flow{flowCount > 1 && 's'}
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
    const {
      flowsTotalCount,
      loading,
      queryParams,
      isAllSelected,
      history,
      bulk,
      emptyBulk,
      currentCategory,
      addFlow
    } = this.props;

    let actionBarRight = (
      <BarItems>
        <FormControl
          type="text"
          placeholder={__('Type to search')}
          onChange={this.search}
          value={this.state.searchValue}
          autoFocus={true}
          onFocus={this.moveCursorAtTheEnd}
        />
        <Button
          btnStyle="success"
          size="small"
          icon="plus-circle"
          onClick={addFlow}
        >
          {__('Create a flow')}
        </Button>
      </BarItems>
    );

    let content = (
      <>
        {this.renderCount(currentCategory.productCount || flowsTotalCount)}
        <Table hover={true}>
          <thead>
            <tr>
              <th style={{ width: 60 }}>
                <FormControl
                  checked={isAllSelected}
                  componentClass="checkbox"
                  onChange={this.onChange}
                />
              </th>
              <th>{__('Name')}</th>
              <th>{__('Status')}</th>
              <th>{__('Is match')}</th>
              <th>{__('branch')}</th>
              <th>{__('department')}</th>
              <th>{__('Jobs count')}</th>
            </tr>
          </thead>
          <tbody>{this.renderRow()}</tbody>
        </Table>
      </>
    );

    if (currentCategory.productCount === 0) {
      content = (
        <EmptyState
          image="/images/actions/8.svg"
          text="No Brands"
          size="small"
        />
      );
    }

    if (bulk.length > 0) {
      const onClick = () =>
        confirm()
          .then(() => {
            this.removeProducts(bulk);
          })
          .catch(error => {
            Alert.error(error.message);
          });

      actionBarRight = (
        <BarItems>
          <Button
            btnStyle="danger"
            size="small"
            icon="cancel-1"
            onClick={onClick}
          >
            Remove
          </Button>
        </BarItems>
      );
    }

    const actionBarLeft = <Title>{currentCategory.name || 'All flows'}</Title>;

    return (
      <Wrapper
        header={<Wrapper.Header title={__('Flow')} submenu={menuContacts} />}
        // mainHead={
        //   <HeaderDescription
        //     icon="/images/actions/30.svg"
        //     title={'Flow'}
        //     description={``}
        //   />
        // }
        actionBar={
          <Wrapper.ActionBar left={actionBarLeft} right={actionBarRight} />
        }
        leftSidebar={
          <CategoryList queryParams={queryParams} history={history} />
        }
        footer={<Pagination count={flowsTotalCount} />}
        content={
          <DataWithLoader
            data={content}
            loading={loading}
            count={flowsTotalCount}
            emptyText="There is no data 2022"
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
