import {
  BarItems,
  Button,
  FormControl,
  HeaderDescription,
  ModalTrigger,
  Pagination,
  Table,
  Tip,
  Wrapper,
  __,
  router
} from '@erxes/ui/src';
import { setParams } from '@erxes/ui/src/utils/router';
import React from 'react';
import { Link } from 'react-router-dom';
import { TableHead } from '../../assessments/components/ListHead';
import { subMenu } from '../../common/constants';
import { FlexRow, HeaderContent } from '../../styles';
import { headers } from '../common/Headers';
import Form from '../containers/Form';
import Row from './Row';

type Props = {
  list: any[];
  totalCount: number;
  queryParams: any;
  history: any;
  removePlans: (ids: string[]) => void;
  duplicatePlan: (_id: string) => void;
  changeStatus: (_id: string, status: string) => void;
};

type State = {
  selectedItems: string[];
  showFilters: boolean;
  searchValue: string;
};

class List extends React.Component<Props, State> {
  private timer?: NodeJS.Timer;
  constructor(props) {
    super(props);

    this.state = {
      selectedItems: [],
      showFilters: false,
      searchValue: props?.queryParams?.searchValue || ''
    };
  }

  renderForm() {
    const trigger = <Button btnStyle="success">{__('Add Plan')}</Button>;

    const content = () => <Form />;

    return (
      <ModalTrigger
        title="Add Plan"
        size="xl"
        content={content}
        trigger={trigger}
      />
    );
  }

  renderContent() {
    const {
      queryParams,
      history,
      list,
      duplicatePlan,
      changeStatus
    } = this.props;
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
            <th>{__('Name')}</th>
            {headers(queryParams, history).map(
              ({ name, label, sort, filter }) => (
                <TableHead key={name} sort={sort} filter={filter}>
                  {label}
                </TableHead>
              )
            )}
            <th>{__('Actions')}</th>
          </tr>
        </thead>
        <tbody>
          {list.map(plan => (
            <Row
              plan={plan}
              selectedItems={selectedItems}
              handleSelect={handleSelect}
              queryParams={this.props.queryParams}
              duplicate={duplicatePlan}
              changeStatus={changeStatus}
            />
          ))}
        </tbody>
      </Table>
    );
  }
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

  render() {
    const { totalCount, removePlans, queryParams, history } = this.props;
    const { selectedItems } = this.state;

    const onSelectFilter = (name, value) => {
      setParams(history, { [name]: value });
    };

    const isArchived = queryParams?.isArchived === 'true';

    const handleRemove = () => {
      removePlans(selectedItems);
      this.setState({ selectedItems: [] });
    };

    const leftActionBar = (
      <HeaderDescription
        title="Plans"
        icon="/images/actions/16.svg"
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

    const rightActionBar = (
      <BarItems>
        {this.renderSearchField()}
        {!!selectedItems.length && (
          <Button btnStyle="danger" onClick={handleRemove}>
            {__(`Remove (${selectedItems.length})`)}
          </Button>
        )}
        <Button btnStyle="success">
          <Link to={`/settings/risk-assessment-plans/add`}>
            {__('Add Plan')}
          </Link>
        </Button>
        <Tip
          text={`See ${isArchived ? 'Active' : 'Archived'} Plans`}
          placement="bottom"
        >
          <Button
            btnStyle="link"
            icon={isArchived ? 'calendar-alt' : 'archive-alt'}
            onClick={() => onSelectFilter('isArchived', !isArchived)}
          />
        </Tip>
      </BarItems>
    );

    return (
      <Wrapper
        header={<Wrapper.Header title={'Plans'} submenu={subMenu} />}
        actionBar={
          <Wrapper.ActionBar left={leftActionBar} right={rightActionBar} />
        }
        content={this.renderContent()}
        footer={<Pagination count={totalCount} />}
      />
    );
  }
}

export default List;
