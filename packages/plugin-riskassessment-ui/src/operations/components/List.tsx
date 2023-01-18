import {
  BarItems,
  Button,
  DataWithLoader,
  FormControl,
  generateTree,
  HeaderDescription,
  ModalTrigger,
  router,
  SortHandler,
  Table,
  __
} from '@erxes/ui/src';
import React from 'react';
import { DefaultWrapper } from '../../common/utils';
import Form from '../containers/Form';
import { subMenu } from '../../common/constants';
import Row from './Row';
import { IRouterProps } from '@erxes/ui/src/types';
type Props = {
  queryParams: any;
  list: any[];
  totalCount: number;
  loading: boolean;
  remove: (ids: string[]) => void;
} & IRouterProps;

type State = {
  selectedItems: string[];
  searchValue: string;
  perPage: number;
};

class List extends React.Component<Props, State> {
  private timer?: NodeJS.Timer;
  constructor(props) {
    super(props);

    this.state = {
      selectedItems: [],
      searchValue: props.queryParams.searchValue || '',
      perPage: 20
    };
  }

  renderAddButton = () => {
    const trigger = <Button btnStyle="success">{__('Add Operation')}</Button>;

    const content = props => (
      <Form {...props} queryParams={this.props.queryParams} />
    );

    return (
      <ModalTrigger content={content} trigger={trigger} title="Add Operation" />
    );
  };

  renderRemoveButton = () => {
    const handleRemove = () => {
      const { selectedItems } = this.state;
      const { remove } = this.props;
      remove(selectedItems);
      this.setState({ selectedItems: [] });
    };

    return (
      <Button btnStyle="danger" onClick={handleRemove}>
        {__('Remove')}
      </Button>
    );
  };

  renderSearchField = () => {
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
        placeholder="type a search"
        onChange={search}
        autoFocus={true}
        value={this.state.searchValue}
        onFocus={moveCursorAtTheEnd}
      />
    );
  };

  renderContent() {
    const { selectedItems } = this.state;
    const handleSelectAll = () => {
      if (!selectedItems.length) {
        const branchIds = this.props.list.map(branch => branch._id);
        return this.setState({ selectedItems: branchIds });
      }

      this.setState({ selectedItems: [] });
    };

    const handleSelect = id => {
      if (selectedItems.includes(id)) {
        const removedSelectedItems = selectedItems.filter(
          selectItem => selectItem !== id
        );
        return this.setState({ selectedItems: removedSelectedItems });
      }
      this.setState({ selectedItems: [...selectedItems, id] });
    };

    const generateList = () => {
      const list = this.props.list.map(branch => {
        if (!this.props.list.find(dep => dep._id === branch.parentId)) {
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
                onClick={handleSelectAll}
              />
            </th>
            <th>{__('Code')}</th>
            <th>{__('Name')}</th>
            <th>{__('Created At')}</th>
            <th>{__('Modified At')}</th>
            <th>{__('Actions')}</th>
          </tr>
        </thead>
        <tbody>
          {generateTree(generateList(), null, (operation, level) => (
            <Row
              operation={operation}
              level={level}
              selectedItems={selectedItems}
              handleSelect={handleSelect}
              queryParams={this.props.queryParams}
            />
          ))}
        </tbody>
      </Table>
    );
  }

  render() {
    const { loading, totalCount } = this.props;
    const { selectedItems } = this.state;

    const rightActionBar = (
      <BarItems>
        {this.renderSearchField()}
        {!!selectedItems.length && this.renderRemoveButton()}
        {this.renderAddButton()}
      </BarItems>
    );

    const leftActionBar = (
      <HeaderDescription
        title="Operations"
        description=""
        icon="/images/actions/16.svg"
      />
    );

    const updateProps = {
      title: 'Operations',
      leftActionBar,
      rightActionBar,
      content: this.renderContent(),
      loading,
      totalCount,
      subMenu
    };

    return <DefaultWrapper {...updateProps} />;
  }
}

export default List;
