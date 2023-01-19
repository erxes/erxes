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
  ModalTrigger,
  HeaderDescription
} from '@erxes/ui/src';
import { IUnit, UnitsQueryResponse } from '@erxes/ui/src/team/types';
import React from 'react';
import SettingsSideBar from '../common/SettingsSideBar';
import Form from '../../containers/unit/Form';

type Props = {
  listQuery: UnitsQueryResponse;
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

  renderForm() {
    const trigger = <Button btnStyle="success">{__('Add Unit')}</Button>;

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
      </tr>
    );

    return (
      <ModalTrigger
        key={unit._id}
        title="Edit Unit"
        content={({ closeModal }) => (
          <Form closeModal={closeModal} unit={unit} />
        )}
        trigger={trigger}
      />
    );
  }

  renderContent() {
    const { listQuery } = this.props;

    const units = listQuery.units || [];

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
          </tr>
        </thead>
        <tbody>{(units || []).map(unit => this.renderRow(unit))}</tbody>
      </Table>
    );
  }
  render() {
    const { listQuery, deleteUnits } = this.props;
    const { selectedItems } = this.state;

    const remove = () => {
      deleteUnits(selectedItems, () => this.setState({ selectedItems: [] }));
    };

    const rightActionBar = (
      <BarItems>
        {this.renderSearch()}
        {!!selectedItems.length && (
          <Button btnStyle="danger" onClick={remove}>
            {__('Remove')}
          </Button>
        )}
        {this.renderForm()}
      </BarItems>
    );

    const leftActionBar = (
      <HeaderDescription
        title="Units"
        icon="/images/actions/21.svg"
        description=""
      />
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
            count={listQuery.units?.length || 0}
            data={this.renderContent()}
            emptyImage="/images/actions/25.svg"
            emptyText="No Units"
          />
        }
        leftSidebar={<SettingsSideBar />}
        footer={<Pagination count={listQuery.units?.length || 0} />}
      />
    );
  }
}

export default MainList;
