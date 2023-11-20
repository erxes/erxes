import { BranchesMainQueryResponse, IBranch } from '@erxes/ui/src/team/types';
import { FilterContainer, InputBar } from '@erxes/ui-settings/src/styles';
import { __, router } from '@erxes/ui/src/utils';

import ActionButtons from '@erxes/ui/src/components/ActionButtons';
import { BarItems } from 'modules/layout/styles';
import Button from 'modules/common/components/Button';
import DataWithLoader from 'modules/common/components/DataWithLoader';
import Form from '../../containers/common/BlockForm';
import FormControl from 'modules/common/components/form/Control';
import Icon from '@erxes/ui/src/components/Icon';
import ModalTrigger from 'modules/common/components/ModalTrigger';
import Pagination from 'modules/common/components/pagination/Pagination';
import React from 'react';
import SettingsSideBar from '../../containers/common/SettingSideBar';
import Table from 'modules/common/components/table';
import Tip from '@erxes/ui/src/components/Tip';
import Wrapper from 'modules/layout/components/Wrapper';
import { generatePaginationParams } from '@erxes/ui/src/utils/router';
import { generateTree } from '../../utils';
import { gql } from '@apollo/client';
import { queries } from '@erxes/ui/src/team/graphql';

type Props = {
  listQuery: BranchesMainQueryResponse;
  deleteBranches: (ids: string[], callback: () => void) => void;
  queryParams: any;
  history: any;
};

type State = {
  selectedItems: string[];
  searchValue: string;
};

class MainList extends React.Component<Props, State> {
  private timer?: NodeJS.Timer;
  constructor(props) {
    super(props);

    this.state = {
      selectedItems: [],
      searchValue: props.queryParams.searchValue || ''
    };
  }

  refetchQueries = () => [
    {
      query: gql(queries.branchesMain),
      variables: {
        withoutUserFilter: true,
        searchValue: undefined,
        ...generatePaginationParams(this.props.queryParams || {})
      }
    }
  ];

  remove = (_id?: string) => {
    if (_id) {
      this.props.deleteBranches([_id], () =>
        this.setState({ selectedItems: [] })
      );
    } else {
      this.props.deleteBranches(this.state.selectedItems, () =>
        this.setState({ selectedItems: [] })
      );
    }
  };

  renderForm() {
    const trigger = (
      <Button btnStyle="success" icon="plus-circle">
        {__('Add Branch')}
      </Button>
    );

    const content = ({ closeModal }) => (
      <Form
        closeModal={closeModal}
        queryType="branches"
        additionalRefetchQueries={this.refetchQueries()}
      />
    );

    return (
      <ModalTrigger title="Add Branch" content={content} trigger={trigger} />
    );
  }

  renderSearch() {
    const search = e => {
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

    const moveCursorAtTheEnd = e => {
      const tmpValue = e.target.value;

      e.target.value = '';
      e.target.value = tmpValue;
    };

    return (
      <FilterContainer marginRight={true}>
        <InputBar type="searchBar">
          <Icon icon="search-1" size={20} />
          <FormControl
            type="text"
            placeholder={__('Type to search')}
            onChange={search}
            value={this.state.searchValue}
            autoFocus={true}
            onFocus={moveCursorAtTheEnd}
          />
        </InputBar>
      </FilterContainer>
    );
  }

  renderRow(branch: IBranch, level) {
    const { selectedItems } = this.state;

    const handleSelect = () => {
      if (selectedItems.includes(branch._id)) {
        const removedSelectedItems = selectedItems.filter(
          selectItem => selectItem !== branch._id
        );
        return this.setState({ selectedItems: removedSelectedItems });
      }
      this.setState({ selectedItems: [...selectedItems, branch._id] });
    };

    const onclick = e => {
      e.stopPropagation();
    };

    const trigger = (
      <Button btnStyle="link">
        <Tip text={__('Edit')} placement="top">
          <Icon icon="edit-3" />
        </Tip>
      </Button>
    );

    return (
      <tr key={branch._id}>
        <td onClick={onclick}>
          <FormControl
            componentClass="checkbox"
            checked={selectedItems.includes(branch._id)}
            onClick={handleSelect}
          />
        </td>
        <td>{__(`${'\u00A0 \u00A0 '.repeat(level)}  ${branch.code}`)}</td>
        <td>{__(branch.title)}</td>
        <td>{branch?.parent?.title || ''}</td>
        <td>{__(branch.address.replace(/\n/g, ''))}</td>
        <td>{branch.userCount}</td>
        <td>
          <ActionButtons>
            <ModalTrigger
              key={branch._id}
              title="Edit Branch"
              content={({ closeModal }) => (
                <Form
                  item={branch}
                  queryType="branches"
                  closeModal={closeModal}
                  additionalRefetchQueries={this.refetchQueries()}
                />
              )}
              trigger={trigger}
            />
            <Tip text={__('Delete')} placement="top">
              <Button
                btnStyle="link"
                onClick={() => this.remove(branch._id)}
                icon="times-circle"
              />
            </Tip>
          </ActionButtons>
        </td>
      </tr>
    );
  }

  renderContent() {
    const { listQuery } = this.props;
    const branches = listQuery?.branchesMain?.list || [];

    const { selectedItems } = this.state;

    const handleSelectAll = () => {
      if (!selectedItems.length) {
        const branchIds = branches.map(branch => branch._id);
        return this.setState({ selectedItems: branchIds });
      }

      this.setState({ selectedItems: [] });
    };

    return (
      <Table>
        <thead>
          <tr>
            <th>
              <FormControl
                componentClass="checkbox"
                checked={branches?.length === selectedItems.length}
                onClick={handleSelectAll}
              />
            </th>
            <th>{__('Code')}</th>
            <th>{__('Title')}</th>
            <th>{__('Parent')}</th>
            <th>{__('Address')}</th>
            <th>{__('Team member count')}</th>
            <th>{__('Actions')}</th>
          </tr>
        </thead>
        <tbody>
          {generateTree(branches, null, (branch, level) =>
            this.renderRow(branch, level)
          )}
          {generateTree(branches, '', (branch, level) =>
            this.renderRow(branch, level)
          )}
        </tbody>
      </Table>
    );
  }

  render() {
    const { listQuery } = this.props;

    const { totalCount } = listQuery.branchesMain;

    const { selectedItems } = this.state;

    const rightActionBar = (
      <BarItems>
        {this.renderSearch()}
        {this.renderForm()}
      </BarItems>
    );

    const leftActionBar = selectedItems.length > 0 && (
      <Button
        btnStyle="danger"
        size="small"
        icon="times-circle"
        onClick={() => this.remove()}
      >
        Remove
      </Button>
    );

    return (
      <Wrapper
        header={
          <Wrapper.Header
            title="Branches"
            breadcrumb={[
              { title: __('Settings'), link: '/settings' },
              { title: __('Branches') }
            ]}
          />
        }
        actionBar={
          <Wrapper.ActionBar left={leftActionBar} right={rightActionBar} />
        }
        content={
          <DataWithLoader
            loading={listQuery.loading}
            count={totalCount || 0}
            data={this.renderContent()}
            emptyImage="/images/actions/5.svg"
            emptyText="No Branches"
          />
        }
        leftSidebar={<SettingsSideBar />}
        footer={<Pagination count={totalCount || 0} />}
        hasBorder={true}
      />
    );
  }
}

export default MainList;
