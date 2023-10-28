import {
  BarItems,
  Button,
  FormControl,
  HeaderDescription,
  ModalTrigger,
  Table,
  __,
  router
} from '@erxes/ui/src';
import { IRouterProps } from '@erxes/ui/src/types';
import React from 'react';
import { subMenu } from '../../../common/constants';
import { DefaultWrapper } from '../../../common/utils';
import { FlexRow, HeaderContent } from '../../../styles';
import Sidebar from '../../components/SideBar';
import { IIndicatorsGroups } from '../common/types';
import Form from '../containers/Form';
import Row from './Row';

type Props = {
  queryParams: any;
  list: IIndicatorsGroups[];
  totalCount: number;
  remove: (ids: string[]) => void;
} & IRouterProps;

type State = {
  searchValue: string;
  selectedItems: string[];
};

class List extends React.Component<Props, State> {
  private timer?: NodeJS.Timer;
  constructor(props) {
    super(props);

    this.state = {
      searchValue: props.queryParams.searchValue || '',
      selectedItems: []
    };
  }

  addIndicatorGroups() {
    const trigger = (
      <Button btnStyle="success">{__('Add Grouping Indicators')}</Button>
    );

    const content = props => (
      <Form queryParams={this.props.queryParams} {...props} />
    );

    return (
      <ModalTrigger
        trigger={trigger}
        content={content}
        enforceFocus={false}
        title="Add Grouping Indicators"
        size="xl"
      />
    );
  }

  renderSearchField = () => {
    const handleSearch = e => {
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

    return (
      <FormControl
        type="text"
        placeholder="type a search"
        onChange={handleSearch}
        value={this.state.searchValue}
      />
    );
  };

  renderRemove = () => {
    const handleRemove = () => {
      this.props.remove(this.state.selectedItems);
      this.setState({ selectedItems: [] });
    };

    return (
      <Button btnStyle="danger" onClick={handleRemove}>
        {__('Remove')}
      </Button>
    );
  };

  renderContent() {
    const { list, queryParams } = this.props;
    const { selectedItems } = this.state;

    const selectAll = () => {
      if (!selectedItems.length) {
        const ids = list.map(item => item._id);
        return this.setState({ selectedItems: ids });
      }

      this.setState({ selectedItems: [] });
    };

    const selectItem = id => {
      if (selectedItems.includes(id)) {
        const newselectedItems = selectedItems.filter(p => p !== id);
        return this.setState({ selectedItems: newselectedItems });
      }
      this.setState({ selectedItems: [...selectedItems, id] });
    };

    return (
      <Table>
        <thead>
          <tr>
            <th>
              <FormControl componentClass="checkbox" onClick={selectAll} />
            </th>
            <th>{__('Name')}</th>
            <th>{__('Tags')}</th>
            <th>{__('Created At')}</th>
            <th>{__('Modified At')}</th>
            <th>{__('')}</th>
          </tr>
        </thead>
        <tbody>
          {list.map(item => (
            <Row
              key={item._id}
              indicatorsGroups={item}
              selectedItems={selectedItems}
              selectItem={selectItem}
              queryParams={queryParams}
            />
          ))}
        </tbody>
      </Table>
    );
  }

  render() {
    const { selectedItems } = this.state;
    const { totalCount, history, queryParams } = this.props;
    const rightActionBar = (
      <BarItems>
        {this.renderSearchField()}
        {!!selectedItems.length && this.renderRemove()}
        {this.addIndicatorGroups()}
      </BarItems>
    );

    const leftActionBar = (
      <HeaderDescription
        title="Indicators Groups"
        icon="/images/actions/24.svg"
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
      title: 'Indicators Groups',
      rightActionBar,
      leftActionBar,
      sidebar: <Sidebar queryParams={queryParams} history={history} />,
      content: this.renderContent(),
      totalCount,
      subMenu
    };

    return <DefaultWrapper {...updatedProps} />;
  }
}
export default List;
