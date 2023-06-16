import {
  BarItems,
  Button,
  FormControl,
  HeaderDescription,
  ModalTrigger,
  SortHandler,
  Table,
  Tip,
  __
} from '@erxes/ui/src';
import { setParams } from '@erxes/ui/src/utils/router';
import React from 'react';
import { Link } from 'react-router-dom';
import { subMenu } from '../../common/constants';
import { DefaultWrapper } from '../../common/utils';
import Form from '../containers/Form';
import Row from './Row';

type Props = {
  list: any[];
  totalCount: number;
  queryParams: any;
  history: any;
  removePlans: (ids: string[]) => void;
};

type State = {
  selectedItems: string[];
  showFilters: boolean;
};

class List extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      selectedItems: [],
      showFilters: false
    };
  }

  renderForm() {
    const trigger = <Button btnStyle="success">{__('Add Plan')}</Button>;

    const content = ({ closeModal }) => <Form closeModal={closeModal} />;

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
    const { list } = this.props;
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
            <th>
              <SortHandler sortField="createdAt" />
              {__('Created At')}
            </th>
            <th>
              <SortHandler sortField="modifiedAt" />
              {__('Modified At')}
            </th>
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
            />
          ))}
        </tbody>
      </Table>
    );
  }

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
      />
    );

    const rightActionBar = (
      <BarItems>
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

    const updatedProps = {
      title: 'Plans',
      content: this.renderContent(),
      totalCount,
      rightActionBar,
      leftActionBar,
      subMenu
    };

    return <DefaultWrapper {...updatedProps} />;
  }
}

export default List;
