import { Alert, __, confirm, router } from '@erxes/ui/src/utils';
import { BarItems } from '@erxes/ui/src/layout/styles';
import Button from '@erxes/ui/src/components/Button';
import Form from '@erxes/ui-products/src/containers/ProductForm';
import FormControl from '@erxes/ui/src/components/form/Control';
import HeaderDescription from '@erxes/ui/src/components/HeaderDescription';
import { IRouterProps } from '@erxes/ui/src/types';
import { Link } from 'react-router-dom';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import Pagination from '@erxes/ui/src/components/pagination/Pagination';
import React from 'react';
import Spinner from '@erxes/ui/src/components/Spinner';
import { TAG_TYPES } from '@erxes/ui-tags/src/constants';
import Table from '@erxes/ui/src/components/table';
import TaggerPopover from '@erxes/ui-tags/src/components/TaggerPopover';
import TemporarySegment from '@erxes/ui-segments/src/components/filter/TemporarySegment';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { isEnabled } from '@erxes/ui/src/utils/core';
import { FlexItem, InputBar } from '@erxes/ui-settings/src/styles';
import { Icon } from '@erxes/ui/src';
import { IItem } from '@erxes/ui-products/src/types';

interface IProps extends IRouterProps {
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
}

type State = {
  searchValue?: string;
  checked?: boolean;
};

class List extends React.Component<IProps, State> {
  private timer?: NodeJS.Timer;

  constructor(props) {
    super(props);

    this.state = {
      searchValue: this.props.searchValue,
      checked: false,
    };
  }

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

  renderContent = () => {
    const { itemsCount, loading, isAllSelected } = this.props;

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
              <th>{__('Code')}</th>
              <th>{__('Name')}</th>
            </tr>
          </thead>
        </Table>
      </>
    );
  };

  render() {
    const { itemsCount, queryParams, history, bulk, emptyBulk } = this.props;

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

        const mergeButton = (
          <Button btnStyle="success" icon="merge">
            Merge
          </Button>
        );

        const tagButton = (
          <Button btnStyle="success" icon="tag-alt">
            Tag
          </Button>
        );

        return (
          <BarItems>
            {isEnabled('tags') && (
              <TaggerPopover
                type={TAG_TYPES.PRODUCT}
                successCallback={emptyBulk}
                targets={bulk}
                trigger={tagButton}
                perPage={1000}
                refetchQueries={['productCountByTags']}
              />
            )}

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
                value={this.state.searchValue}
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
            autoOpenKey="showProductModal"
            content={modalContent}
            size="lg"
          />
        </BarItems>
      );
    };

    return (
      <Wrapper
        header={
          <Wrapper.Header
            title={__('Items')}
            queryParams={queryParams}
            breadcrumb={breadcrumb}
          />
        }
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
        footer={<Pagination count={itemsCount} />}
        content={this.renderContent()}
        transparent={true}
        hasBorder={true}
      />
    );
  }
}

export default List;
