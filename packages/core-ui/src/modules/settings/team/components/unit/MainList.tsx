import {
  BarItems,
  DataWithLoader,
  FormControl,
  Pagination,
  Button,
  router,
  Table,
  Wrapper,
  __,
  ModalTrigger
} from '@erxes/ui/src';
import { IUnit, UnitsMainQueryResponse } from '@erxes/ui/src/team/types';
import React from 'react';
import SettingsSideBar from '../../containers/common/SettingSideBar';
import Form from '../../containers/unit/Form';
import ActionButtons from '@erxes/ui/src/components/ActionButtons';
import Tip from '@erxes/ui/src/components/Tip';
import Icon from '@erxes/ui/src/components/Icon';

type Props = {
  listQuery: UnitsMainQueryResponse;
  deleteUnits: (ids: string[], callback: () => void) => void;
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

  remove = (_id?: string) => {
    if (_id) {
      this.props.deleteUnits([_id], () => this.setState({ selectedItems: [] }));
    } else {
      this.props.deleteUnits(this.state.selectedItems, () =>
        this.setState({ selectedItems: [] })
      );
    }
  };

  renderForm() {
    const trigger = (
      <Button btnStyle="success" icon="plus-circle">
        {__('Add Unit')}
      </Button>
    );

    const content = ({ closeModal }) => <Form closeModal={closeModal} />;

    return (
      <ModalTrigger title="Add Unit" content={content} trigger={trigger} />
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

  renderRow(unit: IUnit) {
    const { selectedItems } = this.state;

    const handleSelect = () => {
      if (selectedItems.includes(unit._id)) {
        const removedSelectedItems = selectedItems.filter(
          selectItem => selectItem !== unit._id
        );
        return this.setState({ selectedItems: removedSelectedItems });
      }
      this.setState({ selectedItems: [...selectedItems, unit._id] });
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
      <tr key={unit._id}>
        <td onClick={onclick}>
          <FormControl
            componentClass="checkbox"
            checked={selectedItems.includes(unit._id)}
            onClick={handleSelect}
          />
        </td>
        <td>{__(unit.code)}</td>
        <td>{__(unit.title)}</td>
        <td>{__(unit?.supervisor?.email)}</td>
        <td>{__(unit?.department?.title || '')}</td>
        <td>{unit.userIds?.length || 0}</td>
        <td>
          <ActionButtons>
            <ModalTrigger
              key={unit._id}
              title="Edit Unit"
              content={({ closeModal }) => (
                <Form closeModal={closeModal} unit={unit} />
              )}
              trigger={trigger}
            />
            <Tip text={__('Delete')} placement="top">
              <Button
                btnStyle="link"
                onClick={() => this.remove(unit._id)}
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

    const units = listQuery.unitsMain.list || [];

    const { selectedItems } = this.state;

    const handleSelectAll = () => {
      if (!selectedItems.length) {
        const unitIds = units.map(unit => unit._id);
        return this.setState({ selectedItems: unitIds });
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
                checked={units?.length === selectedItems.length}
                onClick={handleSelectAll}
              />
            </th>
            <th>{__('Code')}</th>
            <th>{__('Title')}</th>
            <th>{__('Supervisor')}</th>
            <th>{__('Department')}</th>
            <th>{__('Team member count')}</th>
            <th>{__('Actions')}</th>
          </tr>
        </thead>
        <tbody>{(units || []).map(unit => this.renderRow(unit))}</tbody>
      </Table>
    );
  }
  render() {
    const { listQuery } = this.props;

    const { totalCount } = listQuery.unitsMain;

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
            title="Units"
            breadcrumb={[
              { title: __('Settings'), link: '/settings' },
              { title: __('Units') }
            ]}
          />
        }
        actionBar={
          <Wrapper.ActionBar right={rightActionBar} left={leftActionBar} />
        }
        content={
          <DataWithLoader
            loading={listQuery.loading}
            count={totalCount}
            data={this.renderContent()}
            emptyImage="/images/actions/25.svg"
            emptyText="No Units"
          />
        }
        leftSidebar={<SettingsSideBar />}
        footer={<Pagination count={totalCount} />}
        hasBorder={true}
      />
    );
  }
}

export default MainList;
