import Button from '@erxes/ui/src/components/Button';
import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
import FormControl from '@erxes/ui/src/components/form/Control';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import Pagination from '@erxes/ui/src/components/pagination/Pagination';
import Table from '@erxes/ui/src/components/table';
import { Count, Title } from '@erxes/ui/src/styles/main';
import { IRouterProps } from '@erxes/ui/src/types';
import { Alert, confirm, router } from '@erxes/ui/src/utils';
import { __ } from 'coreui/utils';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { BarItems } from '@erxes/ui/src/layout/styles';
import React from 'react';
import Form from '../../containers/refer/Form';
import CategoryList from '../../containers/category/List';
import { IJobRefer } from '../../types';
import Row from './Row';
import { menuSettings } from '../../../constants';

interface IProps extends IRouterProps {
  history: any;
  queryParams: any;
  jobRefers: IJobRefer[];
  jobRefersCount: number;
  isAllSelected: boolean;
  bulk: any[];
  emptyBulk: () => void;
  remove: (doc: { jobRefersIds: string[] }, emptyBulk: () => void) => void;
  toggleBulk: () => void;
  toggleAll: (targets: IJobRefer[], containerId: string) => void;
  loading: boolean;
  searchValue: string;
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
    const { jobRefers, history, toggleBulk, bulk } = this.props;

    return jobRefers.map(jobRefer => (
      <Row
        history={history}
        key={jobRefer._id}
        jobRefer={jobRefer}
        toggleBulk={toggleBulk}
        isChecked={bulk.includes(jobRefer)}
      />
    ));
  };

  onChange = () => {
    const { toggleAll, jobRefers } = this.props;
    toggleAll(jobRefers, 'jobRefers');
  };

  removeProducts = jobRefers => {
    const jobRefersIds: string[] = [];

    jobRefers.forEach(jobRefer => {
      jobRefersIds.push(jobRefer._id);
    });

    this.props.remove({ jobRefersIds }, this.props.emptyBulk);
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
      bulk
    } = this.props;

    const trigger = (
      <Button btnStyle="success" icon="plus-circle">
        {__('Add job')}
      </Button>
    );

    const modalContent = props => <Form {...props} />;

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
        <ModalTrigger
          title="Add Job"
          size="lg"
          trigger={trigger}
          autoOpenKey="showProductModal"
          content={modalContent}
        />
      </BarItems>
    );

    let content = (
      <>
        {this.renderCount(jobRefersCount)}
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
              <th>{__('Code')}</th>
              <th>{__('Type')}</th>
              <th>{__('Need Products')}</th>
              <th>{__('Result Products')}</th>
              <th>{__('Actions')}</th>
            </tr>
          </thead>
          <tbody>{this.renderRow()}</tbody>
        </Table>
      </>
    );

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

    const actionBarLeft = <Title>{`${__('All jobs')}`}</Title>;

    return (
      <Wrapper
        header={<Wrapper.Header title={__('Job')} submenu={menuSettings} />}
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
