import {
  __,
  Alert,
  BarItems,
  Button,
  confirm,
  DataWithLoader,
  FormControl,
  ModalTrigger,
  Pagination,
  router,
  SortHandler,
  Table,
  Wrapper
} from '@erxes/ui/src';
import { IRouterProps } from '@erxes/ui/src/types';
import React from 'react';
import { withRouter } from 'react-router-dom';
import { menuContracts } from '../../constants';

import AdjustmentForm from '../containers/AdjustmentForm';
import { AdjustmentsTableWrapper } from '../styles';
import { IAdjustment } from '../types';
import AdjustmentRow from './AdjustmentRow';

interface IProps extends IRouterProps {
  adjustments: IAdjustment[];
  loading: boolean;
  searchValue: string;
  totalCount: number;
  // TODO: check is below line not throwing error ?
  toggleBulk: () => void;
  toggleAll: (targets: IAdjustment[], containerId: string) => void;
  bulk: any[];
  isAllSelected: boolean;
  emptyBulk: () => void;
  removeAdjustments: (
    doc: { adjustmentIds: string[] },
    emptyBulk: () => void
  ) => void;
  history: any;
  queryParams: any;
}

type State = {
  searchValue?: string;
};

class AdjustmentsList extends React.Component<IProps, State> {
  private timer?: NodeJS.Timer = undefined;

  constructor(props) {
    super(props);

    this.state = {
      searchValue: this.props.searchValue
    };
  }

  onChange = () => {
    const { toggleAll, adjustments } = this.props;
    toggleAll(adjustments, 'adjustments');
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

  removeAdjustments = adjustments => {
    const adjustmentIds: string[] = [];

    adjustments.forEach(adjustment => {
      adjustmentIds.push(adjustment._id);
    });

    this.props.removeAdjustments({ adjustmentIds }, this.props.emptyBulk);
  };

  moveCursorAtTheEnd = e => {
    const tmpValue = e.target.value;
    e.target.value = '';
    e.target.value = tmpValue;
  };

  render() {
    const {
      adjustments,
      history,
      loading,
      toggleBulk,
      bulk,
      isAllSelected,
      totalCount,
      queryParams
    } = this.props;

    const mainContent = (
      <AdjustmentsTableWrapper>
        <Table whiteSpace="nowrap" bordered={true} hover={true}>
          <thead>
            <tr>
              <th>
                <FormControl
                  checked={isAllSelected}
                  componentClass="checkbox"
                  onChange={this.onChange}
                />
              </th>
              <th>
                <SortHandler sortField={'date'} label={__('Date')} />
              </th>
              <th></th>
            </tr>
          </thead>
          <tbody id="adjustments">
            {adjustments.map(adjustment => (
              <AdjustmentRow
                adjustment={adjustment}
                isChecked={bulk.includes(adjustment)}
                key={adjustment._id}
                history={history}
                toggleBulk={toggleBulk}
              />
            ))}
          </tbody>
        </Table>
      </AdjustmentsTableWrapper>
    );

    const addTrigger = (
      <Button btnStyle="success" size="small" icon="plus-circle">
        Add adjustment
      </Button>
    );

    let actionBarLeft: React.ReactNode;

    if (bulk.length > 0) {
      const onClick = () =>
        confirm()
          .then(() => {
            this.removeAdjustments(bulk);
          })
          .catch(error => {
            Alert.error(error.message);
          });

      actionBarLeft = (
        <BarItems>
          <Button
            btnStyle="danger"
            size="small"
            icon="cancel-1"
            onClick={onClick}
          >
            Delete
          </Button>
        </BarItems>
      );
    }

    const adjustmentForm = props => {
      return <AdjustmentForm {...props} queryParams={queryParams} />;
    };

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

        <ModalTrigger
          title="New adjustment"
          trigger={addTrigger}
          autoOpenKey="showAdjustmentModal"
          content={adjustmentForm}
          backDrop="static"
        />
      </BarItems>
    );

    const actionBar = (
      <Wrapper.ActionBar right={actionBarRight} left={actionBarLeft} />
    );

    return (
      <Wrapper
        header={
          <Wrapper.Header
            title={__(`Contracts`) + ` (${totalCount})`}
            queryParams={queryParams}
            submenu={menuContracts}
          />
        }
        actionBar={actionBar}
        footer={<Pagination count={totalCount} />}
        content={
          <DataWithLoader
            data={mainContent}
            loading={loading}
            count={adjustments.length}
            emptyText="Add in your first adjustment!"
            emptyImage="/images/actions/1.svg"
          />
        }
        hasBorder
      />
    );
  }
}

export default withRouter<IRouterProps>(AdjustmentsList);
