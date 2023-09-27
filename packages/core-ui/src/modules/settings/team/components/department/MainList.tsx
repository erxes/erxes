import {
  Button,
  ModalTrigger,
  BarItems,
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
import SettingsSideBar from '../../containers/common/SettingSideBar';
import Form from '../../containers/department/Form';
import { queries } from '@erxes/ui/src/team/graphql';
import { gql } from '@apollo/client';
import { generatePaginationParams } from '@erxes/ui/src/utils/router';
import Tip from '@erxes/ui/src/components/Tip';
import Icon from '@erxes/ui/src/components/Icon';
import ActionButtons from '@erxes/ui/src/components/ActionButtons';

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

  remove = (_id?: string) => {
    if (_id) {
      this.props.deleteDepartments([_id], () =>
        this.setState({ selectedItems: [] })
      );
    } else {
      this.props.deleteDepartments(this.state.selectedItems, () =>
        this.setState({ selectedItems: [] })
      );
    }
  };

  renderForm() {
    const trigger = (
      <Button btnStyle="success" icon="plus-circle">
        {__('Add Department')}
      </Button>
    );

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
      <Button btnStyle="link">
        <Tip text={__('Edit')} placement="top">
          <Icon icon="edit-3" />
        </Tip>
      </Button>
    );

    return (
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
        <td>
          <ActionButtons>
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
            <Tip text={__('Delete')} placement="top">
              <Button
                btnStyle="link"
                onClick={() => this.remove(department._id)}
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
    const departments = listQuery.departmentsMain?.list || [];
    const { selectedItems } = this.state;

    const handleSelectAll = () => {
      if (!selectedItems.length) {
        const departmentIds = departments.map(department => department._id);
        return this.setState({ selectedItems: departmentIds });
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
                checked={departments?.length === selectedItems.length}
                onClick={handleSelectAll}
              />
            </th>
            <th>{__('Code')}</th>
            <th>{__('Title')}</th>
            <th>{__('Supervisor')}</th>
            <th>{__('Team member count')}</th>
            <th>{__('Actions')}</th>
          </tr>
        </thead>
        <tbody>
          {generateTree(departments, null, (department, level) => {
            return this.renderRow(department, level);
          })}
          {generateTree(departments, '', (department, level) => {
            return this.renderRow(department, level);
          })}
        </tbody>
      </Table>
    );
  }

  render() {
    const { listQuery } = this.props;

    const { totalCount } = listQuery.departmentsMain;

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
        hasBorder={true}
      />
    );
  }
}

export default MainList;
