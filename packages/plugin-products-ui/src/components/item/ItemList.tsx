import { __, router } from '@erxes/ui/src/utils';
import HeaderDescription from '@erxes/ui/src/components/HeaderDescription';
import { Title } from '@erxes/ui/src/styles/main';
import Pagination from '@erxes/ui/src/components/pagination/Pagination';
import React, { FormEvent } from 'react';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { IItem } from '../.././types';
import Table from '@erxes/ui/src/components/table';
import FormControl from '@erxes/ui/src/components/form/Control';
import Row from './Row';
import Spinner from '@erxes/ui/src/components/Spinner';
import Button from '@erxes/ui/src/components/Button';
import Alert from '@erxes/ui/src/utils/Alert/Alert';
import { BarItems } from '@erxes/ui/src/layout/styles';
import { InputBar } from '@erxes/ui-settings/src/styles';
import { Link } from 'react-router-dom';
import Icon from '@erxes/ui/src/components/Icon';
import { FlexItem } from '@erxes/ui/src/components/step/style';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import TemporarySegment from '@erxes/ui-segments/src/components/filter/TemporarySegment';
import { isEnabled } from '@erxes/ui/src/utils/core';

type Props = {
  history: any;
  queryParams: any;
  items: IItem[];
  itemsCount: number;
  isAllSelected: boolean;
  bulk: any[];
  emptyBulk: () => void;
  remove: (doc: { Ids: string[] }, emptyBulk: () => void) => void;
  toggleBulk: () => void;
  toggleAll: (targets: IItem[], containerId: string) => void;
  loading: boolean;
  searchValue: string;
};

type State = {
  searchValue?: string;
  checked?: boolean;
};

class List extends React.Component<Props> {
  search: ((e: FormEvent<HTMLElement>) => void) | undefined;

  constructor(props) {
    super(props);

    this.state = {
      searchValue: this.props.searchValue,
      checked: false,
    };
  }

  moveCursorAtTheEnd(e) {
    const tmpValue = e.target.value;

    e.target.value = '';
    e.target.value = tmpValue;
  }

  renderRow = () => {
    const { items, history, bulk } = this.props;

    return items.map((item) => (
      <Row
        history={history}
        item={item}
        isChecked={(bulk || []).map((b) => b._id).includes(item._id)}
      />
    ));
  };

  onChange = () => {
    const { toggleAll, items, bulk, history } = this.props;
    toggleAll(items, 'items');

    if (bulk.length === items.length) {
      router.removeParams(history, 'ids');
      router.setParams(history, { page: 1 });
    }
  };

  removeItems = (items) => {
    const Ids: string[] = [];

    items.forEach((item) => {
      Ids.push(item._id);
    });

    this.props.remove({ Ids }, this.props.emptyBulk);
  };

  renderContent = () => {
    const { loading, isAllSelected } = this.props;

    if (loading) {
      return <Spinner objective={true} />;
    }
    return (
      <>
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
              <th>{__('Name')}</th>
              <th>{__('Code')}</th>
              <th>{__('Description')}</th>
              <th>{__('Actions')}</th>
            </tr>
          </thead>
          <tbody>{this.renderRow()}</tbody>
        </Table>
      </>
    );
  };

  render() {
    const { itemsCount, bulk } = this.props;

    const breadcrumb = [
      { title: __('Settings'), link: '/settings' },
      { title: __('Items') },
    ];

    const trigger = (
      <Button btnStyle="success" icon="plus-circle">
        Add items
      </Button>
    );

    const modalContent = (props) => <>hi</>;

    const actionBarRight = () => {
      return (
        <BarItems>
          <InputBar type="searchBar">
            <Icon icon="search-1" size={20} />
            <FlexItem>
              <FormControl
                type="text"
                placeholder={__('Type to search')}
                onChange={this.search}
                autoFocus={true}
                onFocus={this.moveCursorAtTheEnd}
              />
            </FlexItem>
          </InputBar>
          {isEnabled('segments') && (
            <TemporarySegment btnSize="medium" contentType={`items:item`} />
          )}
          <Link to="/settings/importHistories?type=item">
            <Button btnStyle="simple" icon="arrow-from-right">
              {__('Import items')}
            </Button>
          </Link>
          <ModalTrigger
            title="Add Items"
            trigger={trigger}
            autoOpenKey="showItemModal"
            content={modalContent}
            size="lg"
          />
        </BarItems>
      );
    };

    const actionBarLeft = <Title>{`${'All items'} (${itemsCount})`}</Title>;

    return (
      <Wrapper
        header={<Wrapper.Header title={__('Items')} breadcrumb={breadcrumb} />}
        mainHead={
          <HeaderDescription
            icon="/images/actions/30.svg"
            title={'Items'}
            description={`${__(
              'All information and know-how related to your business items are found here',
            )}.${__(
              'Create and add in unlimited items so that you and your team members can edit and share',
            )}`}
          />
        }
        actionBar={
          <Wrapper.ActionBar left={actionBarLeft} right={actionBarRight()} />
        }
        footer={<Pagination count={itemsCount} />}
        content={this.renderContent()}
        transparent={true}
        hasBorder={true}
      />
    );
  }
}

export default List;
