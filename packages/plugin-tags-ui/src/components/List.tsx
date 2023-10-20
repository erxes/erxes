import Button from '@erxes/ui/src/components/Button';
import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
import FormComponent from '@erxes/ui-tags/src/components/Form';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import { ITag } from '@erxes/ui-tags/src/types';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import React from 'react';
import Row from './Row';
import Sidebar from './Sidebar';
import Table from '@erxes/ui/src/components/table';
import {
  FilterContainer,
  FlexItem,
  FlexRow,
  InputBar,
  Title
} from '@erxes/ui-settings/src/styles';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { __, router } from '@erxes/ui/src/utils';
import Icon from '@erxes/ui/src/components/Icon';
import { FormControl } from '@erxes/ui/src/components/form';
import { LoadMore } from '@erxes/ui-cards/src/boards/styles/rightMenu';

type Props = {
  types: any[];
  tags: ITag[];
  type: string;
  history: any;
  hasMore: boolean;
  queryParams?: any;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  remove: (tag: ITag) => void;
  merge: (sourceId: string, destId: string, callback) => void;
  loading: boolean;
};

function List({
  tags,
  type,
  remove,
  merge,
  loading,
  renderButton,
  types,
  history,
  hasMore,
  queryParams
}: Props) {
  let timer;
  const [searchValue, setSearchValue] = React.useState(queryParams.searchValue);
  const contentType = (type || '').split(':')[1];

  const trigger = (
    <Button id={'AddTagButton'} btnStyle="success" icon="plus-circle">
      Add tag
    </Button>
  );

  const modalContent = props => (
    <FormComponent
      {...props}
      type={type}
      types={types}
      renderButton={renderButton}
      tags={tags}
    />
  );

  const search = e => {
    if (timer) {
      clearTimeout(timer);
    }

    const inputValue = e.target.value;

    setSearchValue(inputValue);

    timer = setTimeout(() => {
      router.setParams(history, { searchValue: inputValue });
    }, 500);
  };

  const actionBarRight = (
    <FilterContainer>
      <FlexRow>
        <InputBar type="searchBar">
          <Icon icon="search-1" size={20} />
          <FlexItem>
            <FormControl
              placeholder={__('Search')}
              name="searchValue"
              onChange={search}
              value={searchValue}
              autoFocus={true}
            />
          </FlexItem>
        </InputBar>
        <ModalTrigger
          title={__('Add tag')}
          autoOpenKey={`showTag${type}Modal`}
          trigger={trigger}
          content={modalContent}
          enforceFocus={false}
        />
      </FlexRow>
    </FilterContainer>
  );

  const title = (
    <Title capitalize={true}>
      {contentType} {__('tags')}
    </Title>
  );
  const actionBar = (
    <Wrapper.ActionBar left={title} right={actionBarRight} wideSpacing />
  );
  // console.log('hasMore:', hasMore);
  const content = (
    <Table>
      <thead>
        <tr>
          <th>{__('Name')}</th>
          <th>{__('Total item counts')}</th>
          <th>{__('Item counts')}</th>
          <th>{__('Actions')}</th>
        </tr>
      </thead>
      <tbody id={'TagsShowing'}>
        {tags.map(tag => {
          const order = tag.order || '';
          const foundedString = order.match(/[/]/gi);

          return (
            <Row
              key={tag._id}
              tag={tag}
              count={tag.objectCount}
              type={type}
              types={types}
              space={foundedString ? foundedString.length : 0}
              remove={remove}
              merge={merge}
              renderButton={renderButton}
              tags={tags}
            />
          );
        })}
      </tbody>
      {hasMore ? (
        <LoadMore>
          <Icon icon="redo" />
          {__('Load More')}
        </LoadMore>
      ) : null}
    </Table>
  );

  const breadcrumb = [
    { title: __('Settings'), link: '/settings' },
    { title: __('Tags'), link: '/settings/tags' }
  ];

  return (
    <Wrapper
      header={
        <Wrapper.Header
          title={__(contentType)}
          queryParams={{ type }}
          breadcrumb={breadcrumb}
          filterTitle={contentType}
        />
      }
      actionBar={actionBar}
      content={
        <DataWithLoader
          data={content}
          loading={loading}
          count={tags.length}
          emptyText={__('There is no tag') + '.'}
          emptyImage="/images/actions/8.svg"
        />
      }
      leftSidebar={<Sidebar types={types} type={type} />}
      transparent={true}
      hasBorder
    />
  );
}

export default List;
