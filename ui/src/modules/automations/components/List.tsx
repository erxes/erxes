import Button from 'modules/common/components/Button';
import DataWithLoader from 'modules/common/components/DataWithLoader';
import FormControl from 'modules/common/components/form/Control';
import Pagination from 'modules/common/components/pagination/Pagination';
import Table from 'modules/common/components/table';
import withTableWrapper from 'modules/common/components/table/withTableWrapper';
import { __, Alert, confirm, router } from 'modules/common/utils';
import Wrapper from 'modules/layout/components/Wrapper';
import { BarItems } from 'modules/layout/styles';
import React from 'react';
import { Link, withRouter } from 'react-router-dom';
import { IRouterProps } from '../../common/types';
import { IAutomation } from '../types';
import Row from './Row';

interface IProps extends IRouterProps {
  automations: IAutomation[];
  loading: boolean;
  searchValue: string;
  totalCount: number;
  // TODO: check is below line not throwing error ?
  toggleBulk: () => void;
  toggleAll: (targets: IAutomation[], containerId: string) => void;
  bulk: any[];
  isAllSelected: boolean;
  emptyBulk: () => void;
  removeAutomations: (
    doc: { automationIds: string[] },
    emptyBulk: () => void
  ) => void;
  queryParams: any;
  exportAutomations: (bulk: string[]) => void;
  refetch?: () => void;
  renderExpandButton?: any;
  isExpand?: boolean;
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
      isExpand
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
            </tr>
          </thead>
          <tbody id="automations" className={isExpand ? 'expand' : ''}>
            {(automations || []).map(automation => (
              <Row
                automation={automation}
                isChecked={bulk.includes(automation)}
                key={automation._id}
                history={history}
                toggleBulk={toggleBulk}
              />
            ))}
          </tbody>
        </Table>
      </withTableWrapper.Wrapper>
    );

    let actionBarLeft: React.ReactNode;

    if (bulk.length > 0) {
      const onClick = () =>
        confirm()
          .then(() => {
            this.removeAutomations(bulk);
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
            Remove
          </Button>
        </BarItems>
      );
    }

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
        <Link to="/automations/blank">
          <Button btnStyle="success" size="small" icon="plus-circle">
            {__('New automation')}
          </Button>
        </Link>
      </BarItems>
    );

    const actionBar = (
      <Wrapper.ActionBar right={actionBarRight} left={actionBarLeft} />
    );

    return (
      <Wrapper
        header={
          <Wrapper.Header
            title={__(`Automations`) + ` (${totalCount})`}
            queryParams={queryParams}
          />
        }
        actionBar={actionBar}
        footer={<Pagination count={totalCount} />}
        content={
          <DataWithLoader
            data={mainContent}
            loading={loading}
            count={(automations || []).length}
            emptyText="Add in your first automation!"
            emptyImage="/images/actions/1.svg"
          />
        }
      />
    );
  }
}

export default withTableWrapper(
  'Company',
  withRouter<IRouterProps>(AutomationsList)
);
