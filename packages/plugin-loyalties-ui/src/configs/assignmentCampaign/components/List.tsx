import { Alert, __, confirm, router } from '@erxes/ui/src/utils';
import {
  Button,
  DataWithLoader,
  FormControl,
  HeaderDescription,
  Pagination,
  Table
} from '@erxes/ui/src/components';
import {
  FilterContainer,
  FlexItem,
  FlexRow,
  InputBar,
  Title
} from '@erxes/ui-settings/src/styles';

import CreateForm from './CreateForm';
import { IAssignmentCampaign } from '../types';
import Icon from '@erxes/ui/src/components/Icon';
import { Link } from 'react-router-dom';
import React from 'react';
import Row from './Row';
import Sidebar from '../../general/components/Sidebar';
import { Wrapper } from '@erxes/ui/src/layout';

type Props = {
  assignmentCampaigns: IAssignmentCampaign[];
  loading: boolean;
  isAllSelected: boolean;
  toggleAll: (targets: IAssignmentCampaign[], containerId: string) => void;
  history: any;
  queryParams: any;
  bulk: any[];
  emptyBulk: () => void;
  toggleBulk: () => void;
  remove: (
    doc: { assignmentCampaignIds: string[] },
    emptyBulk: () => void
  ) => void;
  searchValue: string;
  filterStatus: string;
  totalCount?: number;
};

type State = {
  searchValue: string;
  filterStatus: string;
};

class AssignmentCampaigns extends React.Component<Props, State> {
  private timer?: NodeJS.Timer;

  constructor(props: Props) {
    super(props);

    this.state = {
      searchValue: this.props.searchValue || '',
      filterStatus: this.props.filterStatus || ''
    };
  }

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

  onChange = () => {
    const { toggleAll, assignmentCampaigns } = this.props;
    toggleAll(assignmentCampaigns, 'assignmentCampaigns');
  };

  renderRow = () => {
    const { assignmentCampaigns, history, toggleBulk, bulk } = this.props;

    return assignmentCampaigns.map(assignmentCampaign => (
      <Row
        key={assignmentCampaign._id}
        history={history}
        assignmentCampaign={assignmentCampaign}
        toggleBulk={toggleBulk}
        isChecked={bulk.includes(assignmentCampaign)}
      />
    ));
  };

  formContent = props => {
    const { queryParams, history } = this.props;
    return (
      <CreateForm {...props} queryParams={queryParams} history={history} />
    );
  };

  removeAssignmentCampaigns = assignmentCampaigns => {
    const assignmentCampaignIds: string[] = [];

    assignmentCampaigns.forEach(assignmentCampaign => {
      assignmentCampaignIds.push(assignmentCampaign._id);
    });

    this.props.remove({ assignmentCampaignIds }, this.props.emptyBulk);
  };

  actionBarRight() {
    const { bulk } = this.props;

    if (bulk.length) {
      const onClick = () =>
        confirm()
          .then(() => {
            this.removeAssignmentCampaigns(bulk);
          })
          .catch(error => {
            Alert.error(error.message);
          });

      return (
        <Button
          btnStyle="danger"
          size="small"
          icon="cancel-1"
          onClick={onClick}
        >
          Remove
        </Button>
      );
    }

    return (
      <FilterContainer>
        <FlexRow>
          <InputBar type="searchBar">
            <Icon icon="search-1" size={20} />
            <FlexItem>
              <FormControl
                type="text"
                placeholder={__('Type to search')}
                onChange={this.search}
                value={this.state.searchValue}
                autoFocus={true}
                onFocus={this.moveCursorAtTheEnd}
              />
            </FlexItem>
          </InputBar>
          <Link to={`/erxes-plugin-loyalty/settings/assignment/create`}>
            <Button btnStyle="success" size="medium" icon="plus-circle">
              Add assignment campaign
            </Button>
          </Link>
        </FlexRow>
      </FilterContainer>
    );
  }

  render() {
    const { loading, isAllSelected, totalCount } = this.props;

    const breadcrumb = [
      { title: __('Settings'), link: '/settings' },
      {
        title: __('Loyalties config'),
        link: '/erxes-plugin-loyalty/settings/general'
      },
      { title: __('Assignment Campaign') }
    ];

    const header = (
      <HeaderDescription
        icon="/images/actions/25.svg"
        title="Loyalty configs"
        description=""
      />
    );

    const content = (
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
            <th>{__('Title')}</th>
            <th>{__('Start Date')}</th>
            <th>{__('End Date')}</th>
            <th>{__('Finish Date of Use')}</th>
            <th>{__('Status')}</th>
            <th>{__('Actions')}</th>
          </tr>
        </thead>
        <tbody>{this.renderRow()}</tbody>
      </Table>
    );

    return (
      <Wrapper
        header={
          <Wrapper.Header
            title={__('Assignment Campaign')}
            breadcrumb={breadcrumb}
          />
        }
        mainHead={header}
        actionBar={
          <Wrapper.ActionBar
            left={<Title>{__('Assignment Campaign')}</Title>}
            right={this.actionBarRight()}
          />
        }
        content={
          <DataWithLoader
            data={content}
            loading={loading}
            count={totalCount}
            emptyText="There is no data"
            emptyImage="/images/actions/5.svg"
          />
        }
        leftSidebar={<Sidebar />}
        transparent={true}
        hasBorder={true}
        footer={<Pagination count={totalCount && totalCount} />}
      />
    );
  }
}

export default AssignmentCampaigns;
