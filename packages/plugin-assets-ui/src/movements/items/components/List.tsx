import {
  BarItems,
  Button,
  FormControl,
  ModalTrigger,
  router,
  Table,
  __
} from '@erxes/ui/src';
import React from 'react';
import { menuMovements } from '../../../common/constant';
import { IMovementItem } from '../../../common/types';
import { DefaultWrapper } from '../../../common/utils';
import Form from '../../containers/Form';
import Row from './Row';
import SideBar from './Sidebar';
type Props = {
  items: IMovementItem[];
  totalCount: number;
  history: any;
  queryParams: any;
};

type State = {
  searchValue: string;
};

class MovementItem extends React.Component<Props, State> {
  private timer?: NodeJS.Timer;
  constructor(props) {
    super(props);

    this.state = {
      searchValue: props.queryParams.searchValue || ''
    };
  }

  search = e => {
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
  moveCursorAtTheEnd(e) {
    const tmpValue = e.target.value;

    e.target.value = '';
    e.target.value = tmpValue;
  }

  renderForm() {
    const trigger = (
      <Button btnStyle="success" icon="plus-circle">
        Add Movement
      </Button>
    );

    const content = props => {
      const updatedProps = {
        ...props,
        queryParams: this.props.queryParams || {}
      };

      return <Form {...updatedProps} />;
    };
    return (
      <ModalTrigger
        title="Add Movement"
        content={content}
        trigger={trigger}
        size="xl"
      />
    );
  }

  renderRow() {
    const { items, queryParams } = this.props;
    return items.map(movement => (
      <Row key={movement._id} item={movement} queryParams={queryParams} />
    ));
  }

  renderList() {
    return (
      <Table>
        <thead>
          <tr>
            <th>{__('Asset Name')}</th>
            <th>{__('Branch')}</th>
            <th>{__('Department')}</th>
            <th>{__('Team Member')}</th>
            <th>{__('Company')}</th>
            <th>{__('Customer')}</th>
            <th>{__('Created At')}</th>
            <th>{__('Actions')}</th>
          </tr>
        </thead>
        <tbody>{this.renderRow()}</tbody>
      </Table>
    );
  }

  render() {
    const { totalCount, history, queryParams } = this.props;

    let rightActionBar = (
      <BarItems>
        <FormControl
          type="text"
          placeholder={__('Type to search')}
          onChange={this.search}
          value={this.state.searchValue}
          autoFocus={true}
          onFocus={this.moveCursorAtTheEnd}
        />
        {this.renderForm()}
      </BarItems>
    );

    const updatedProps = {
      title: 'Asset Movement Items',
      subMenu: menuMovements,
      rightActionBar,
      content: this.renderList(),
      sidebar: <SideBar history={history} queryParams={queryParams} />,
      totalCount
    };

    return <DefaultWrapper {...updatedProps} />;
  }
}

export default MovementItem;
