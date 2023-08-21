import {
  Button,
  ModalTrigger,
  BarItems,
  HeaderDescription,
  FormControl,
  DataWithLoader,
  Wrapper,
  Pagination,
  Table,
  router,
  __,
  generateTree
} from '@erxes/ui/src';
import {
  DepartmentsMainQueryResponse,
  IDepartment
} from '@erxes/ui/src/team/types';
import React from 'react';
import SettingsSideBar from '../common/SettingsSideBar';
import Form from '../../containers/department/Form';
import { queries } from '@erxes/ui/src/team/graphql';
import { gql } from '@apollo/client';
import { generatePaginationParams } from '@erxes/ui/src/utils/router';
import { DescriptionContentRow } from '../common/DescriptionContentRow';
type Props = {
  listQuery: DepartmentsMainQueryResponse;
  queryParams: any;
  history: any;
  deleteDepartments: (ids: string[], callback: () => void) => void;
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
      query: gql(queries.departmentsMain),
      variables: {
        withoutUserFilter: true,
        searchValue: undefined,
        ...generatePaginationParams(this.props.queryParams || {})
      }
    }
  ];

  renderForm() {
    const trigger = <Button btnStyle="success">{__('Add Department')}</Button>;

    const content = ({ closeModal }) => (
      <Form
        closeModal={closeModal}
        additionalRefetchQueries={this.refetchQueries()}
      />
    );

    return (
      <ModalTrigger
        title="Add Department"
        content={content}
        trigger={trigger}
      />
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

  renderRow(department: IDepartment, level) {
    const { selectedItems } = this.state;

    const handleSelect = () => {
      if (selectedItems.includes(department._id)) {
        const removedSelectedItems = selectedItems.filter(
          selectItem => selectItem !== department._id
        );
        return this.setState({ selectedItems: removedSelectedItems });
      }
      this.setState({ selectedItems: [...selectedItems, department._id] });
    };

    const onclick = e => {
      e.stopPropagation();
    };

    const trigger = (
      <tr key={department._id}>
        <td onClick={onclick}>
          <FormControl
            componentClass="checkbox"
            checked={selectedItems.includes(department._id)}
            onClick={handleSelect}
          />
        </td>
        <td>{__(`${'\u00A0 \u00A0 '.repeat(level)}  ${department.code}`)}</td>
        <td>{__(department.title)}</td>
        <td>{__(department?.supervisor?.email || '-')}</td>
        <td>{department.userCount}</td>
      </tr>
    );

    return (
      <ModalTrigger
        key={department._id}
        title="Edit Department"
        content={({ closeModal }) => (
          <Form
            department={department}
            additionalRefetchQueries={this.refetchQueries()}
            closeModal={closeModal}
          />
        )}
        trigger={trigger}
      />
    );
  }

  renderContent() {
    const { listQuery } = this.props;
    const departments = listQuery.departmentsMain?.list || [];
    const { selectedItems } = this.state;

    const handleSelectAll = () => {
      if (!selectedItems.length) {
        const departmentIds = departments.map(department => department._id);
        return this.setState({ selectedItems: departmentIds });
      }

      this.setState({ selectedItems: [] });
    };

    const generateList = () => {
      const list = departments.map(department => {
        if (!departments.find(dep => dep._id === department.parentId)) {
          department.parentId = null;
        }
        return department;
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
                checked={departments?.length === selectedItems.length}
                onClick={handleSelectAll}
              />
            </th>
            <th>{__('Code')}</th>
            <th>{__('Title')}</th>
            <th>{__('Supervisor')}</th>
            <th>{__('Team member count')}</th>
          </tr>
        </thead>
        <tbody>
          {generateTree(generateList(), null, (department, level) => {
            return this.renderRow(department, level);
          })}
        </tbody>
      </Table>
    );
  }

  render() {
    const { listQuery, deleteDepartments } = this.props;

    const { totalCount, totalUsersCount } = listQuery.departmentsMain;

    const { selectedItems } = this.state;

    const remove = () => {
      deleteDepartments(selectedItems, () =>
        this.setState({ selectedItems: [] })
      );
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
        title="Departments"
        icon="/images/actions/21.svg"
        description=""
        renderExtra={DescriptionContentRow({
          label: 'departments',
          totalCount: totalCount,
          teamMembersCount: totalUsersCount
        })}
      />
    );
    return (
      <Wrapper
        header={
          <Wrapper.Header
            title="Departments"
            breadcrumb={[
              { title: __('Settings'), link: '/settings' },
              { title: __('Departments') }
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
