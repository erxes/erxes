import Button from 'modules/common/components/Button';
import DataWithLoader from 'modules/common/components/DataWithLoader';
import FormControl from 'modules/common/components/form/Control';
import Pagination from 'modules/common/components/pagination/Pagination';
import Table from 'modules/common/components/table';
import withTableWrapper from 'modules/common/components/table/withTableWrapper';
import { __, router } from 'modules/common/utils';
import Wrapper from 'modules/layout/components/Wrapper';
import { BarItems } from 'modules/layout/styles';
import React from 'react';
import { withRouter } from 'react-router-dom';
import { IRouterProps } from '../../common/types';
import { IAutomation, AutomationsCount } from '../types';
import Row from './Row';
import { EmptyContent } from '../styles';
import Sidebar from './Sidebar';

interface IProps extends IRouterProps {
  automations: IAutomation[];
  loading: boolean;
  searchValue: string;
  totalCount: number;
  toggleBulk: () => void;
  toggleAll: (targets: IAutomation[], containerId: string) => void;
  bulk: any[];
  isAllSelected: boolean;
  emptyBulk: () => void;
  addAutomation: () => void;
  removeAutomations: (
    doc: { automationIds: string[] },
    emptyBulk: () => void
  ) => void;
  queryParams: any;
  exportAutomations: (bulk: string[]) => void;
  refetch?: () => void;
  renderExpandButton?: any;
  isExpand?: boolean;
  counts: AutomationsCount;
}

type State = {
  searchValue?: string;
};

class AutomationsList extends React.Component<IProps, State> {
  private timer?: NodeJS.Timer = undefined;

  constructor(props) {
    super(props);

    this.state = {
      searchValue: this.props.searchValue
    };
  }

  onChange = () => {
    const { toggleAll, automations } = this.props;

    toggleAll(automations, 'automations');
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

  removeAutomations = automations => {
    const automationIds: string[] = [];

    automations.forEach(automation => {
      automationIds.push(automation._id);
    });

    this.props.removeAutomations({ automationIds }, this.props.emptyBulk);
  };

  moveCursorAtTheEnd = e => {
    const tmpValue = e.target.value;
    e.target.value = '';
    e.target.value = tmpValue;
  };

  afterTag = () => {
    this.props.emptyBulk();

    if (this.props.refetch) {
      this.props.refetch();
    }
  };

  render() {
    const {
      history,
      loading,
      toggleBulk,
      bulk,
      isAllSelected,
      totalCount,
      queryParams,
      isExpand,
      counts,
      addAutomation
    } = this.props;

    const automations = this.props.automations || [];

    const mainContent = (
      <withTableWrapper.Wrapper>
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
              <th>{__('Name')}</th>
              <th>{__('Status')}</th>
              <th>{__('Triggers')}</th>
              <th>{__('Action')}</th>
              <th>{__('Last updated by')}</th>
              <th>{__('Created by')}</th>
              <th>{__('Last update')}</th>
              <th>{__('Created date')}</th>
              <th>{__('Actions')}</th>
            </tr>
          </thead>
          <tbody id="automations" className={isExpand ? 'expand' : ''}>
            {(automations || []).map(automation => (
              <Row
                key={automation._id}
                automation={automation}
                isChecked={bulk.includes(automation)}
                history={history}
                removeAutomations={this.removeAutomations}
                toggleBulk={toggleBulk}
              />
            ))}
          </tbody>
        </Table>
      </withTableWrapper.Wrapper>
    );

    let actionBarLeft: React.ReactNode;

    if (bulk.length > 0) {
      actionBarLeft = (
        <BarItems>
          <Button
            btnStyle="danger"
            size="small"
            icon="cancel-1"
            onClick={() => this.removeAutomations(bulk)}
          >
            Remove
          </Button>
        </BarItems>
      );
    }

    const actionBarRight = (
      <BarItems>
        <FormControl
          type="text"
          placeholder={__('Search an automation')}
          onChange={this.search}
          value={this.state.searchValue}
          autoFocus={true}
          onFocus={this.moveCursorAtTheEnd}
        />

        <Button
          btnStyle="success"
          size="small"
          icon="plus-circle"
          onClick={addAutomation}
        >
          {__('Create an automation')}
        </Button>
      </BarItems>
    );

    const actionBar = (
      <Wrapper.ActionBar right={actionBarRight} left={actionBarLeft} />
    );

    return (
      <Wrapper
        header={
          <Wrapper.Header
            title={__('Automations')}
            breadcrumb={[{ title: __('Automations') }]}
            queryParams={queryParams}
          />
        }
        actionBar={actionBar}
        leftSidebar={<Sidebar counts={counts || {}} />}
        footer={<Pagination count={totalCount} />}
        content={
          <DataWithLoader
            data={mainContent}
            loading={loading}
            count={(automations || []).length}
            emptyContent={
              <EmptyContent>
                <img src="/images/actions/automation.svg" alt="empty-img" />

                <p>
                  <b>{__('You don’t have any automations yet')}.</b>
                  {__(
                    'Automatically execute repetitive tasks and make sure nothing falls through the cracks'
                  )}
                  .
                </p>
              </EmptyContent>
            }
          />
        }
      />
    );
  }
}

export default withTableWrapper(
  'Automation',
  withRouter<IRouterProps>(AutomationsList)
);
