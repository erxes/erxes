import React from 'react';
import Row from './Row';
import Sidebar from './Sidebar';
import { __, Alert, confirm, router } from '@erxes/ui/src/utils';
import { BarItems, Wrapper } from '@erxes/ui/src/layout';
import {
  Button,
  DataWithLoader,
  FormControl,
  ModalTrigger,
  Table
} from '@erxes/ui/src/components';
import { IReserveRem } from '../types';
import { MainStyleTitle as Title } from '@erxes/ui/src/styles/eindex';
import Form from '../containers/Form';
import { SUBMENU } from '../../constants';
import Pagination from '@erxes/ui/src/components/pagination/Pagination';

type Props = {
  reserveRems: IReserveRem[];
  totalCount: number;
  isAllSelected: boolean;
  toggleAll: (targets: IReserveRem[], containerId: string) => void;
  history: any;
  queryParams: any;
  bulk: any[];
  emptyBulk: () => void;
  toggleBulk: () => void;
  remove: (doc: { reserveRemIds: string[] }, emptyBulk: () => void) => void;
  edit: (doc: IReserveRem) => void;
  searchValue: string;
};

type State = {
  searchValue: string;
};

class ReserveRems extends React.Component<Props, State> {
  private timer?: NodeJS.Timer;

  constructor(props: Props) {
    super(props);

    this.state = {
      searchValue: this.props.searchValue || ''
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

  onChange = () => {
    const { toggleAll, reserveRems } = this.props;
    toggleAll(reserveRems, 'reserveRems');
  };

  renderRow = () => {
    const { reserveRems, history, toggleBulk, bulk, edit } = this.props;

    return reserveRems.map(reserveRem => (
      <Row
        key={reserveRem._id}
        history={history}
        reserveRem={reserveRem}
        toggleBulk={toggleBulk}
        isChecked={bulk.includes(reserveRem)}
        edit={edit}
      />
    ));
  };

  modalContent = props => {
    return <Form {...props} />;
  };

  removeReserveRems = reserveRems => {
    const reserveRemIds: string[] = [];

    reserveRems.forEach(reserveRem => {
      reserveRemIds.push(reserveRem._id);
    });

    this.props.remove({ reserveRemIds }, this.props.emptyBulk);
  };

  actionBarRight() {
    const { bulk } = this.props;

    if (bulk.length) {
      const onClick = () =>
        confirm()
          .then(() => {
            this.removeReserveRems(bulk);
          })
          .catch(error => {
            Alert.error(error.message);
          });

      return (
        <Button
          btnStyle="danger"
          size="small"
          icon="cancel-1"
          onClick={onClick}
        >
          Remove
        </Button>
      );
    }

    const trigger = (
      <Button btnStyle="success" icon="plus-circle">
        Add remainders
      </Button>
    );

    return (
      <BarItems>
        <FormControl
          type="text"
          placeholder={__('Type to search')}
          onChange={this.search}
          value={this.state.searchValue}
          autoFocus={true}
          onFocus={this.moveCursorAtTheEnd}
        />
        <ModalTrigger
          size={'lg'}
          title="Add label"
          trigger={trigger}
          autoOpenKey="showProductModal"
          content={this.modalContent}
        />
      </BarItems>
    );
  }

  render() {
    const { isAllSelected, totalCount, queryParams, history } = this.props;

    const content = (
      <Table hover={true}>
        <thead>
          <tr>
            <th style={{ width: 60 }}>
              <FormControl
                checked={isAllSelected}
                componentClass="checkbox"
                onChange={this.onChange}
              />
            </th>
            <th>{__('Branch')}</th>
            <th>{__('Department')}</th>
            <th>{__('Product')}</th>
            <th>{__('Uom')}</th>
            <th>{__('Remainder')}</th>
            <th>{__('')}</th>
          </tr>
        </thead>
        <tbody>{this.renderRow()}</tbody>
      </Table>
    );

    return (
      <Wrapper
        header={
          <Wrapper.Header title={__('Sales Year plans')} submenu={SUBMENU} />
        }
        actionBar={
          <Wrapper.ActionBar
            left={<Title>{__('Reserve Remainders')}</Title>}
            right={this.actionBarRight()}
          />
        }
        leftSidebar={<Sidebar queryParams={queryParams} history={history} />}
        content={
          <DataWithLoader
            data={content}
            loading={false}
            count={totalCount}
            emptyText="There is no data"
            emptyImage="/images/actions/5.svg"
          />
        }
        footer={<Pagination count={totalCount} />}
        transparent={true}
        hasBorder
      />
    );
  }
}

export default ReserveRems;
