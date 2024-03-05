import {
  FilterContainer,
  InputBar,
  FlexItem,
  Title,
  LeftActionBar,
  FlexRow
} from '@erxes/ui-settings/src/styles';
import { IUnit, UnitsMainQueryResponse } from '@erxes/ui/src/team/types';
import { __, router } from '@erxes/ui/src/utils';

import ActionButtons from '@erxes/ui/src/components/ActionButtons';
import Button from 'modules/common/components/Button';
import DataWithLoader from 'modules/common/components/DataWithLoader';
import Form from '../../containers/common/BlockForm';
import FormControl from 'modules/common/components/form/Control';
import Icon from '@erxes/ui/src/components/Icon';
import LeftSidebar from '@erxes/ui/src/layout/components/Sidebar';
import ModalTrigger from 'modules/common/components/ModalTrigger';
import Pagination from 'modules/common/components/pagination/Pagination';
import React from 'react';
import SettingsSideBar from '../../containers/common/SettingSideBar';
import SidebarHeader from '@erxes/ui-settings/src/common/components/SidebarHeader';
import Table from 'modules/common/components/table';
import Tip from '@erxes/ui/src/components/Tip';
import Wrapper from 'modules/layout/components/Wrapper';
import { queries } from '@erxes/ui/src/team/graphql';
import { gql } from '@apollo/client';

type Props = {
  listQuery: UnitsMainQueryResponse;
  deleteUnits: (ids: string[], callback: () => void) => void;
  queryParams: any;
  history: any;
  units: IUnit[];
  loading: boolean;
  totalCount: number;
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
      query: gql(queries.unitsMain),
      variables: {
        searchValue: undefined
      }
    }
  ];

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

    const content = ({ closeModal }) => (
      <Form
        queryType="units"
        closeModal={closeModal}
        additionalRefetchQueries={this.refetchQueries()}
      />
    );

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
      <FilterContainer marginRight={true}>
        <InputBar type="searchBar">
          <Icon icon="search-1" size={20} />
          <FlexItem>
            <FormControl
              type="text"
              placeholder={__('Type to search')}
              onChange={search}
              value={this.state.searchValue}
              autoFocus={true}
              onFocus={moveCursorAtTheEnd}
            />
          </FlexItem>
        </InputBar>
      </FilterContainer>
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
        <td>{unit.userCount}</td>
        <td>
          <ActionButtons>
            <ModalTrigger
              key={unit._id}
              title="Edit Unit"
              content={({ closeModal }) => (
                <Form
                  closeModal={closeModal}
                  item={unit}
                  queryType="units"
                  additionalRefetchQueries={this.refetchQueries()}
                />
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
    const { units } = this.props;
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

  renderButtons = () => {
    const { selectedItems } = this.state;

    if (selectedItems.length > 0) {
      return (
        <Button
          btnStyle="danger"
          icon="times-circle"
          onClick={() => this.remove()}
        >
          Remove
        </Button>
      );
    }

    return (
      <>
        {this.renderSearch()}
        {this.renderForm()}
      </>
    );
  };

  renderActionBar = () => {
    const { totalCount } = this.props;

    const rightActionBar = <FlexRow>{this.renderButtons()}</FlexRow>;

    const leftActionBar = (
      <LeftActionBar>
        <Title>{`Units (${totalCount})`}</Title>
      </LeftActionBar>
    );

    return <Wrapper.ActionBar right={rightActionBar} left={leftActionBar} />;
  };

  render() {
    const { totalCount, loading } = this.props;

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
        actionBar={this.renderActionBar()}
        content={
          <DataWithLoader
            loading={loading}
            count={totalCount || 0}
            data={this.renderContent()}
            emptyImage="/images/actions/25.svg"
            emptyText="No Units"
          />
        }
        leftSidebar={
          <LeftSidebar header={<SidebarHeader />} hasBorder={true}>
            <SettingsSideBar />
          </LeftSidebar>
        }
        footer={<Pagination count={totalCount} />}
        hasBorder={true}
      />
    );
  }
}

export default MainList;
