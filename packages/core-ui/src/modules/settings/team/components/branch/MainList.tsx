import {
  Button,
  ModalTrigger,
  BarItems,
  HeaderDescription,
  FormControl,
  Table,
  Wrapper,
  DataWithLoader,
  Pagination,
  router,
  __
} from '@erxes/ui/src';
import { BranchesMainQueryResponse, IBranch } from '@erxes/ui/src/team/types';
import React from 'react';
import SettingsSideBar from '../common/SettingsSideBar';
import Form from '../../containers/branch/Form';
import { generateTree } from '../../utils';
import { queries } from '@erxes/ui/src/team/graphql';
import { gql } from '@apollo/client';
import { generatePaginationParams } from '@erxes/ui/src/utils/router';
import { DescriptionContentRow } from '../common/DescriptionContentRow';

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

  renderForm() {
    const trigger = <Button btnStyle="success">{__('Add Branch')}</Button>;

    const content = ({ closeModal }) => (
      <Form
        closeModal={closeModal}
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
      <FormControl
        type="text"
        placeholder={__('Type to search')}
        onChange={search}
        value={this.state.searchValue}
        autoFocus={true}
        onFocus={moveCursorAtTheEnd}
      />
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
      </tr>
    );
    return (
      <ModalTrigger
        key={branch._id}
        title="Edit Branch"
        content={({ closeModal }) => (
          <Form
            branch={branch}
            closeModal={closeModal}
            additionalRefetchQueries={this.refetchQueries()}
          />
        )}
        trigger={trigger}
      />
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

    const generateList = () => {
      const list = branches.map(branch => {
        if (!branches.find(dep => dep._id === branch.parentId)) {
          branch.parentId = null;
        }
        return branch;
      });
      return list;
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
          </tr>
        </thead>
        <tbody>
          {generateTree(generateList(), null, (branch, level) =>
            this.renderRow(branch, level)
          )}
        </tbody>
      </Table>
    );
  }

  deleteBranches() {
    const {} = this.state;
  }

  render() {
    const { listQuery, deleteBranches } = this.props;

    const { totalCount, totalUsersCount } = listQuery.branchesMain;

    const { selectedItems } = this.state;

    const remove = () => {
      deleteBranches(selectedItems, () => this.setState({ selectedItems: [] }));
    };

    const rightActionBar = (
      <BarItems>
        {this.renderSearch()}
        {!!selectedItems.length && (
          <Button btnStyle="danger" onClick={remove}>
            {__(`Remove ${selectedItems.length}`)}
          </Button>
        )}
        {this.renderForm()}
      </BarItems>
    );

    const leftActionBar = (
      <HeaderDescription
        title="Branches"
        icon="/images/actions/21.svg"
        description=""
        renderExtra={DescriptionContentRow({
          label: 'branches',
          totalCount: totalCount,
          teamMembersCount: totalUsersCount
        })}
      />
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
          <Wrapper.ActionBar right={rightActionBar} left={leftActionBar} />
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
      />
    );
  }
}

export default MainList;
