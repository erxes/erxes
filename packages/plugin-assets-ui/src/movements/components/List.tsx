import { Title } from '@erxes/ui-settings/src/styles';
import {
  BarItems,
  Bulk,
  Button,
  FormControl,
  ModalTrigger,
  router,
  Table,
  Tip,
  __
} from '@erxes/ui/src';
import { IRouterProps } from '@erxes/ui/src/types';
import React from 'react';
import { menuMovements } from '../../common/constant';
import { IMovementType } from '../../common/types';
import { DefaultWrapper } from '../../common/utils';
import { ContainerBox } from '../../style';
import Form from '../containers/Form';
import Row from './Row';
import { SideBar } from './Sidebar';
type Props = {
  movements: IMovementType[];
  totalCount: number;
  loading: boolean;
  remove: (ids: string[]) => void;
  history: any;
  queryParams: any;
} & IRouterProps;
type State = {
  searchValue: string;
  selectedRows: string[];
};

class List extends React.Component<Props, State> {
  private timer?: NodeJS.Timer;
  constructor(props) {
    super(props);

    this.state = {
      searchValue: props.queryParams.searchValue || '',
      selectedRows: []
    };

    this.renderList = this.renderList.bind(this);
  }
  renderRightActionBarButton = (
    <Button btnStyle="success" icon="plus-circle">
      Add Movement
    </Button>
  );
  renderRightActionBarContent = props => {
    const { queryParams } = this.props;

    const updatedProps = {
      ...props,
      queryParams
    };

    return <Form {...updatedProps} />;
  };
  renderRightActionBar = (
    <ModalTrigger
      title="Add Movement"
      content={this.renderRightActionBarContent}
      trigger={this.renderRightActionBarButton}
      size="xl"
    />
  );

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

  renderRow(props) {
    const { movements, history, queryParams } = this.props;

    const handleSelecteRow = (
      movement: IMovementType,
      movementId: string,
      isChecked?: boolean
    ) => {
      const { selectedRows } = this.state;

      props.toggleBulk(movement, isChecked);

      if (!isChecked) {
        const newSelectedRow = selectedRows.filter(item => item !== movementId);
        return this.setState({ selectedRows: newSelectedRow });
      }
      this.setState({ selectedRows: [...selectedRows, movementId] });
    };

    return movements.map(movement => (
      <Row
        key={movement._id}
        movement={movement}
        history={history}
        toggleBulk={handleSelecteRow}
        isChecked={props.bulk.includes(movement)}
        queryParams={queryParams}
      />
    ));
  }

  renderList(props) {
    const { isAllSelected, toggleAll } = props;
    const { movements } = this.props;

    const onchange = () => {
      toggleAll(movements, 'movements');
      this.setState({
        selectedRows: !isAllSelected
          ? movements.map(movement => movement._id || '')
          : []
      });
    };
    return (
      <Table>
        <thead>
          <tr>
            <th style={{ width: 60 }}>
              <FormControl
                checked={isAllSelected}
                componentClass="checkbox"
                onChange={onchange}
              />
            </th>
            <th>{__('User')}</th>
            <th>{__('Moved At')}</th>
            <th>{__('Description')}</th>
            <th>{__('Created At')}</th>
            <th>{__('Modified At')}</th>
            <th>{__('Action')}</th>
          </tr>
        </thead>
        <tbody>{this.renderRow(props)}</tbody>
      </Table>
    );
  }

  render() {
    const { totalCount, history, queryParams } = this.props;
    const { selectedRows } = this.state;

    const remove = () => {
      this.props.remove(selectedRows);
      this.setState({ selectedRows: [] });
    };

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
        {this.renderRightActionBar}
        {selectedRows.length > 0 && (
          <Tip text="Remove movement" placement="bottom">
            <Button btnStyle="danger" icon="cancel-1" onClick={remove} />
          </Tip>
        )}
      </BarItems>
    );

    const leftActionBar = (
      <ContainerBox row>
        <Title>{'All Movements'}</Title>
      </ContainerBox>
    );

    const updatedProps = {
      title: 'Asset Movements',
      rightActionBar,
      leftActionBar,
      content: <Bulk content={this.renderList} />,
      sidebar: <SideBar history={history} queryParams={queryParams} />,
      subMenu: menuMovements,
      totalCount
    };

    return <DefaultWrapper {...updatedProps} />;
  }
}

export default List;
