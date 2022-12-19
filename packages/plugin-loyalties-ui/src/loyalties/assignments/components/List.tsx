import { __, Alert, confirm, router } from '@erxes/ui/src/utils';
import {
  Button,
  DataWithLoader,
  FormControl,
  ModalTrigger,
  Pagination,
  SortHandler,
  Table
} from '@erxes/ui/src/components';
import { Wrapper } from '@erxes/ui/src/layout';
import {
  MainStyleTitle as Title,
  MainStyleCount as Count
} from '@erxes/ui/src/styles/eindex';
import { BarItems } from '@erxes/ui/src/layout/styles';
import { IRouterProps } from '@erxes/ui/src/types';
import React from 'react';
import { withRouter } from 'react-router-dom';
import AssignmentForm from '../containers/Form';
import { LoyaltiesTableWrapper } from '../../common/styles';
import { IAssignment } from '../types';
import AssignmentRow from './Row';
import Sidebar from './Sidebar';
import { IAssignmentCampaign } from '../../../configs/assignmentCampaign/types';
import { menuLoyalties } from '../../common/constants';

interface IProps extends IRouterProps {
  assignments: IAssignment[];
  currentCampaign?: IAssignmentCampaign;
  loading: boolean;
  searchValue: string;
  totalCount: number;
  toggleBulk: () => void;
  toggleAll: (targets: IAssignment[], containerId: string) => void;
  bulk: any[];
  isAllSelected: boolean;
  emptyBulk: () => void;
  removeAssignments: (
    doc: { assignmentIds: string[] },
    emptyBulk: () => void
  ) => void;
  history: any;
  queryParams: any;
}

type State = {
  searchValue?: string;
};

class AssignmentsList extends React.Component<IProps, State> {
  private timer?: NodeJS.Timer = undefined;

  constructor(props) {
    super(props);

    this.state = {
      searchValue: this.props.searchValue
    };
  }

  onChange = () => {
    const { toggleAll, assignments } = this.props;
    toggleAll(assignments, 'assignments');
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

  removeAssignments = assignments => {
    const assignmentIds: string[] = [];

    assignments.forEach(assignment => {
      assignmentIds.push(assignment._id);
    });

    this.props.removeAssignments({ assignmentIds }, this.props.emptyBulk);
  };

  moveCursorAtTheEnd = e => {
    const tmpValue = e.target.value;
    e.target.value = '';
    e.target.value = tmpValue;
  };

  render() {
    const {
      assignments,
      history,
      loading,
      toggleBulk,
      bulk,
      isAllSelected,
      totalCount,
      queryParams,
      currentCampaign
    } = this.props;

    const mainContent = (
      <LoyaltiesTableWrapper>
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
                <SortHandler sortField={'createdAt'} label={__('Created')} />
              </th>
              <th>
                <SortHandler sortField={'ownerId'} label={__('Owner')} />
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody id="assignments">
            {assignments.map(assignment => (
              <AssignmentRow
                assignment={assignment}
                isChecked={bulk.includes(assignment)}
                key={assignment._id}
                history={history}
                toggleBulk={toggleBulk}
                currentCampaign={currentCampaign}
                queryParams={queryParams}
              />
            ))}
          </tbody>
        </Table>
      </LoyaltiesTableWrapper>
    );

    const addTrigger = (
      <Button btnStyle="success" size="small" icon="plus-circle">
        Add assignment
      </Button>
    );

    const assignmentForm = props => {
      return (
        <AssignmentForm
          {...props}
          queryParams={queryParams}
          history={history}
        />
      );
    };

    const actionBarRight = () => {
      if (bulk.length > 0) {
        const onClick = () =>
          confirm()
            .then(() => {
              this.removeAssignments(bulk);
            })
            .catch(error => {
              Alert.error(error.message);
            });

        return (
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
      return (
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
            title="New assignment"
            trigger={addTrigger}
            autoOpenKey="showAssignmentModal"
            content={assignmentForm}
            backDrop="static"
          />
        </BarItems>
      );
    };

    const actionBarLeft = (
      <Title>
        {(currentCampaign && `${currentCampaign.title}`) ||
          'All assignment campaigns'}{' '}
      </Title>
    );
    const actionBar = (
      <Wrapper.ActionBar right={actionBarRight()} left={actionBarLeft} />
    );

    return (
      <Wrapper
        header={
          <Wrapper.Header
            title={__(`Assignments`) + ` (${totalCount})`}
            submenu={menuLoyalties}
          />
        }
        actionBar={actionBar}
        footer={<Pagination count={totalCount} />}
        leftSidebar={
          <Sidebar
            loadingMainQuery={loading}
            queryParams={queryParams}
            history={history}
          />
        }
        content={
          <>
            <Count>
              {totalCount} assignment{totalCount > 1 && 's'}
            </Count>
            <DataWithLoader
              data={mainContent}
              loading={loading}
              count={assignments.length}
              emptyText="Add in your first assignment!"
              emptyImage="/images/actions/1.svg"
            />
          </>
        }
        hasBorder
      />
    );
  }
}

export default withRouter<IRouterProps>(AssignmentsList);
