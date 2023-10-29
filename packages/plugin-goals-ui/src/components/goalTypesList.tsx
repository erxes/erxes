import {
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

import GoalTypeForm from '../containers/goalForm';
import { GoalTypesTableWrapper } from '../styles';
import { IGoalType } from '../types';
import GoalRow from './goalRow';
import { __ } from 'coreui/utils';
import dayjs from 'dayjs';
import { IBoard, IPipeline, IStage } from '../types';
interface IProps extends IRouterProps {
  goalTypes: IGoalType[];
  loading: boolean;
  searchValue: string;
  totalCount: number;
  // TODO: check is below line not throwing error ?
  toggleBulk: () => void;
  toggleAll: (targets: IGoalType[], containerId: string) => void;
  bulk: any[];
  isAllSelected: boolean;
  emptyBulk: () => void;
  removeGoalTypes: (
    doc: { goalTypeIds: string[] },
    emptyBulk: () => void
  ) => void;
  history: any;
  queryParams: any;
}

type State = {
  searchValue?: string;
};

class GoalTypesList extends React.Component<IProps, State> {
  private timer?: NodeJS.Timer = undefined;

  constructor(props) {
    super(props);

    this.state = {
      searchValue: this.props.searchValue
    };
  }

  onChange = () => {
    const { toggleAll, goalTypes } = this.props;
    toggleAll(goalTypes, 'goalTypes');
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

  removeGoalTypes = goalTypes => {
    const goalTypeIds: string[] = [];

    goalTypes.forEach(goalType => {
      goalTypeIds.push(goalType._id);
    });

    this.props.removeGoalTypes({ goalTypeIds }, this.props.emptyBulk);
  };

  moveCursorAtTheEnd = e => {
    const tmpValue = e.target.value;
    e.target.value = '';
    e.target.value = tmpValue;
  };

  render() {
    const {
      goalTypes,
      history,
      loading,
      toggleBulk,
      bulk,
      isAllSelected,
      totalCount,
      queryParams
    } = this.props;
    const mainContent = (
      <GoalTypesTableWrapper>
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
              <th>{__('entity ')}</th>
              <th>{__('boardName ')}</th>
              <th>{__('pipelineName ')}</th>
              <th>{__('stageName ')}</th>
              <th>{__('contributionType')}</th>
              <th>{__('frequency')}</th>
              <th>{__('metric')}</th>
              <th>{__('goalType')}</th>
              <th>{__('startDate')}</th>
              <th>{__('endDate')}</th>
              <th>{__('current')}</th>
              <th>{__('target')}</th>
              <th>{__('progress(%)')}</th>
              <th>{__('View')}</th>
              <th>{__('Edit')}</th>
            </tr>
          </thead>
          <tbody id="goalTypes">
            {goalTypes.map(goalType => (
              <GoalRow
                goalType={goalType}
                isChecked={bulk.includes(goalType)}
                key={goalType._id}
                history={history}
                toggleBulk={toggleBulk}
              />
            ))}
          </tbody>
        </Table>
      </GoalTypesTableWrapper>
    );

    const addTrigger = (
      <Button btnStyle="success" size="small" icon="plus-circle">
        {__('Add Goal')}
      </Button>
    );

    let actionBarLeft: React.ReactNode;

    if (bulk.length > 0) {
      const onClick = () =>
        confirm()
          .then(() => {
            this.removeGoalTypes(bulk);
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
            {__('Delete')}
          </Button>
        </BarItems>
      );
    }

    const goalTypeForm = props => {
      return <GoalTypeForm {...props} queryParams={queryParams} />;
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
          size="lg"
          title={__('New Goal')}
          trigger={addTrigger}
          autoOpenKey="showGoalTypeModal"
          content={goalTypeForm}
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
            title={__(`GoalTypes`) + ` (${totalCount})`}
            queryParams={queryParams}
            breadcrumb={[
              { title: __('Settings'), link: '/settings' },
              { title: __('Goal') }
            ]}
          />
        }
        actionBar={actionBar}
        footer={<Pagination count={totalCount} />}
        content={
          <DataWithLoader
            data={mainContent}
            loading={loading}
            count={goalTypes.length}
            emptyText="Add in your first goalType!"
            emptyImage="/images/actions/1.svg"
          />
        }
      />
    );
  }
}

export default withRouter<IRouterProps>(GoalTypesList);
