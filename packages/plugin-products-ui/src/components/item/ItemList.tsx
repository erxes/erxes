import { Alert, __, confirm, router } from '@erxes/ui/src/utils';
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
import { BarItems } from '@erxes/ui/src/layout/styles';
import { InputBar } from '@erxes/ui-settings/src/styles';
import Icon from '@erxes/ui/src/components/Icon';
import { FlexItem } from '@erxes/ui/src/components/step/style';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import TemporarySegment from '@erxes/ui-segments/src/components/filter/TemporarySegment';
import { isEnabled } from '@erxes/ui/src/utils/core';
import Form from '../../containers/item/ItemForm';

type Props = {
  history: any;
  queryParams: any;
  items: IItem[];
  itemsTotalCount: number;
  isAllSelected: boolean;
  bulk: any[];
  emptyBulk: () => void;
  remove: (doc: { itemIds: string[] }, emptyBulk: () => void) => void;
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
  private timer?: NodeJS.Timer;

  constructor(props) {
    super(props);

    this.state = {
      searchValue: this.props.searchValue,
      checked: false,
    };
  }

  renderRow = () => {
    const { items, history, toggleBulk, bulk } = this.props;

    return items.map((item) => (
      <Row
        history={history}
        item={item}
        toggleBulk={toggleBulk}
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
    const itemIds: string[] = [];

    items.forEach((item) => {
      itemIds.push(item._id);
    });

    this.props.remove({ itemIds }, this.props.emptyBulk);
  };

  search = (e) => {
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
  onChangeChecked = (e) => {
    const { bulk, history } = this.props;
    const checked = e.target.checked;

    if (checked && (bulk || []).length) {
      this.setState({ checked: true });
      this.setState({ searchValue: '' });
      router.removeParams(history, 'page', 'searchValue');
      router.setParams(history, {
        ids: (bulk || []).map((b) => b._id).join(','),
      });
    } else {
      this.setState({ checked: false });
      router.removeParams(history, 'page', 'ids');
    }
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
    const { itemsTotalCount, queryParams, history, bulk, emptyBulk } =
      this.props;

    const breadcrumb = [
      { title: __('Settings'), link: '/settings' },
      { title: __('Items') },
    ];

    const trigger = (
      <Button btnStyle="success" icon="plus-circle">
        Add items
      </Button>
    );

    const modalContent = (props) => <Form {...props} />;

    const actionBarRight = () => {
      if (bulk.length > 0) {
        const onClick = () =>
          confirm()
            .then(() => {
              this.removeItems(bulk);
            })
            .catch((error) => {
              Alert.error(error.message);
            });

        return (
          <BarItems>
            <Button btnStyle="danger" icon="cancel-1" onClick={onClick}>
              Remove
            </Button>
          </BarItems>
        );
      }

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

    const actionBarLeft = (
      <Title>{`${'All items'} (${itemsTotalCount})`}</Title>
    );

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
        footer={<Pagination count={itemsTotalCount} />}
        content={this.renderContent()}
        transparent={true}
        hasBorder={true}
      />
    );
  }
}

export default List;
