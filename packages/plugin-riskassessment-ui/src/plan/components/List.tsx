import {
  BarItems,
  Button,
  FormControl,
  HeaderDescription,
  ModalTrigger,
  Table,
  __
} from '@erxes/ui/src';
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
};

type State = {
  selectedItems: string[];
};

class List extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      selectedItems: []
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
            <th>{__('Created At')}</th>
            <th>{__('Modified At')}</th>
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
    const { totalCount } = this.props;

    const leftActionBar = (
      <HeaderDescription
        title="Plans"
        icon="/images/actions/16.svg"
        description=""
      />
    );

    const rightActionBar = (
      <BarItems>
        <Button btnStyle="success">
          <Link to={`/settings/risk-assessment-plans/add`}>
            {__('Add Plan')}
          </Link>
        </Button>
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
