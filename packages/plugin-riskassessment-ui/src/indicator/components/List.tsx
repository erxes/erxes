import {
  BarItems,
  Button,
  FormControl,
  HeaderDescription,
  SortHandler,
  Table,
  __
} from '@erxes/ui/src';
import { IRouterProps } from '@erxes/ui/src/types';
import { isEnabled } from '@erxes/ui/src/utils/core';
import _loadash from 'lodash';
import React from 'react';
import { Link } from 'react-router-dom';
import { subMenu } from '../../common/constants';
import { ICommonListProps } from '../../common/types';
import { DefaultWrapper } from '../../common/utils';
import { FlexRow, HeaderContent } from '../../styles';
import { RiskIndicatorsType } from '../common/types';
import TableRow from './Row';
import SideBar from './SideBar';

type Props = {
  queryParams: any;
  list: RiskIndicatorsType[];
  totalCount: number;
  refetch: ({
    perPage,
    searchValue
  }: {
    perPage: number;
    searchValue: string;
  }) => void;
  duplicate: (_id: string) => void;
} & ICommonListProps &
  IRouterProps;

type IState = {
  selectedItems: string[];
  perPage: number;
  searchValue: string;
};

class ListComp extends React.Component<Props, IState> {
  constructor(props) {
    super(props);

    this.state = {
      selectedItems: [],
      perPage: 20,
      searchValue: ''
    };
    this.selectItem = this.selectItem.bind(this);
  }

  selectItem(id: string) {
    const { selectedItems } = this.state;
    if (selectedItems.includes(id)) {
      const newSelectedValue = selectedItems.filter(p => p !== id);
      return this.setState({ selectedItems: newSelectedValue });
    }
    this.setState({ selectedItems: [...selectedItems, id] });
  }

  selectAllValue(items) {
    if (
      _loadash.isEqual(
        items.map(object => object._id),
        this.state.selectedItems
      )
    ) {
      return this.setState({ selectedItems: [] });
    }
    const ids = items.map(item => item._id);
    this.setState({ selectedItems: ids });
  }

  handleRemoveBtn = () => {
    const { remove } = this.props;
    const { selectedItems } = this.state;
    remove(selectedItems);
    this.setState({ selectedItems: [] });
  };

  handleSearch = e => {
    const { value } = e.currentTarget as HTMLInputElement;

    const { perPage } = this.state;

    this.setState({ searchValue: value, selectedItems: [] });

    setTimeout(() => {
      this.props.refetch({ searchValue: value, perPage });
    }, 700);
  };

  renderSearchField = () => {
    return (
      <FormControl
        type="text"
        placeholder="type a search"
        onChange={this.handleSearch}
        value={this.state.searchValue}
      />
    );
  };

  renderContent = (list: RiskIndicatorsType[]) => {
    const { selectedItems } = this.state;

    const { queryParams, duplicate, history } = this.props;

    return (
      <Table>
        <thead>
          <tr>
            <th>
              {list && (
                <FormControl
                  componentClass="checkbox"
                  checked={_loadash.isEqual(
                    selectedItems,
                    list.map(object => object._id)
                  )}
                  onChange={() => this.selectAllValue(list)}
                />
              )}
            </th>
            <th>{__('Name')}</th>
            {isEnabled('tags') && <th>{__('Tags')}</th>}
            <th>
              <SortHandler />
              {__('Create At')}
            </th>
            <th>
              <SortHandler />
              {__('Modified At')}
            </th>
            <th>{__('Action')}</th>
          </tr>
        </thead>
        <tbody>
          {list?.map((item, i) => {
            const updatedProps = {
              indicator: item,
              selectedItems,
              queryParams,
              history,
              handleDuplicate: duplicate,
              onChange: this.selectItem
            };

            return <TableRow key={i} {...updatedProps} />;
          })}
        </tbody>
      </Table>
    );
  };

  render() {
    const { list, queryParams, totalCount } = this.props;
    const { selectedItems } = this.state;

    const rightActionBar = (
      <BarItems>
        {<>{this.renderSearchField()}</>}
        {selectedItems.length > 0 && (
          <Button
            btnStyle="danger"
            icon="cancel-1"
            onClick={this.handleRemoveBtn}
          >
            {__(`Remove (${selectedItems.length})`)}
          </Button>
        )}
        <Button btnStyle="success">
          <Link to={`/settings/risk-indicators/add`}>
            {__('Add New Indicator')}
          </Link>
        </Button>
      </BarItems>
    );

    const leftActionBar = (
      <HeaderDescription
        title="Risk Indicators"
        icon="/images/actions/26.svg"
        description=""
        renderExtra={
          <FlexRow>
            <HeaderContent>
              {__(`Total count`)}
              <h4>{totalCount || 0}</h4>
            </HeaderContent>
          </FlexRow>
        }
      />
    );

    const updatedProps = {
      ...this.props,
      title: 'Indicator List',
      rightActionBar: rightActionBar,
      leftActionBar,
      content: this.renderContent(list),
      sidebar: (
        <SideBar queryParams={queryParams} history={this.props.history} />
      ),
      subMenu
    };

    return <DefaultWrapper {...updatedProps} />;
  }
}

export default ListComp;
