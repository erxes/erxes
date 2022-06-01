import Button from '@erxes/ui/src/components/Button';
import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
import EmptyState from '@erxes/ui/src/components/EmptyState';
import FormControl from '@erxes/ui/src/components/form/Control';
import HeaderDescription from '@erxes/ui/src/components/HeaderDescription';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import Pagination from '@erxes/ui/src/components/pagination/Pagination';
import Table from '@erxes/ui/src/components/table';
import { Count, Title } from '@erxes/ui/src/styles/main';
import { IRouterProps } from '@erxes/ui/src/types';
import { __, Alert, confirm, router } from '@erxes/ui/src/utils';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { BarItems } from '@erxes/ui/src/layout/styles';
import TaggerPopover from '@erxes/ui/src/tags/components/TaggerPopover';
import React from 'react';
import Form from '../../containers/product/ProductForm';
import CategoryList from '../../containers/productCategory/CategoryList';
import { IProductCategory, IFlowDocument } from '../../types';
import Row from './ProductRow';
import { menuContacts } from '../../../constants';
import { TAG_TYPES } from '@erxes/ui/src/tags/constants';
import { isEnabled } from '@erxes/ui/src/utils/core';

interface IProps extends IRouterProps {
  history: any;
  queryParams: any;
  flows: IFlowDocument[];
  jobRefersCount: number;
  isAllSelected: boolean;
  bulk: any[];
  emptyBulk: () => void;
  remove: (doc: { flowIds: string[] }, emptyBulk: () => void) => void;
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

  renderCount = productCount => {
    return (
      <Count>
        {productCount} job{productCount > 1 && 's'}
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
      jobRefersCount,
      loading,
      queryParams,
      isAllSelected,
      history,
      bulk,
      emptyBulk,
      currentCategory
    } = this.props;

    const breadcrumb = [
      { title: __('Settings'), link: '/settings' },
      { title: __('Product & Service') }
    ];

    const trigger = (
      <Button btnStyle="success" icon="plus-circle">
        Add flow
      </Button>
    );

    const onTrClick = () => {
      history.push(`/processes/flows/details/add`);
    };

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
        <Button btnStyle="primary" icon="plus-circle" onClick={onTrClick}>
          Add flow
        </Button>
      </BarItems>
    );

    let content = (
      <>
        {this.renderCount(currentCategory.productCount || jobRefersCount)}
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
        footer={<Pagination count={jobRefersCount} />}
        content={
          <DataWithLoader
            data={content}
            loading={loading}
            count={jobRefersCount}
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
