import {
  FilterContainer,
  FlexItem,
  FlexRow,
  InputBar,
  Title
} from '@erxes/ui-settings/src/styles';
import { __, router } from '@erxes/ui/src/utils';

import Button from '@erxes/ui/src/components/Button';
import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
import FormComponent from '@erxes/ui-tags/src/components/Form';
import { FormControl } from '@erxes/ui/src/components/form';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import { ITag } from '@erxes/ui-tags/src/types';
import Icon from '@erxes/ui/src/components/Icon';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import Pagination from '@erxes/ui/src/components/pagination/Pagination';
import React from 'react';
import Row from './Row';
import Sidebar from './Sidebar';
import Table from '@erxes/ui/src/components/table';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';

type Props = {
  types: any[];
  tags: ITag[];
  tagType: string;
  history: any;
  queryParams?: any;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  remove: (tag: ITag) => void;
  merge: (sourceId: string, destId: string, callback) => void;
  loading: boolean;
  total: number;
};

function List({
  tags,
  tagType,
  remove,
  merge,
  loading,
  renderButton,
  types,
  history,
  total,
  queryParams
}: Props) {
  const [searchValue, setSearchValue] = React.useState(queryParams.searchValue);
  const contentType = (tagType || '').split(':')[1];

  const trigger = (
    <Button id={'AddTagButton'} btnStyle="success" icon="plus-circle">
      Add tag
    </Button>
  );

  const modalContent = props => (
    <FormComponent
      {...props}
      tagType={tagType}
      types={types}
      renderButton={renderButton}
      tags={tags}
    />
  );

  const search = e => {
    const inputValue = e.target.value;

    setSearchValue(inputValue);

    router.setParams(history, { searchValue: inputValue });
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
          autoOpenKey={`showTag${tagType}Modal`}
          trigger={trigger}
          content={modalContent}
          enforceFocus={false}
        />
      </FlexRow>
    </FilterContainer>
  );

  const title = (
    <Title capitalize={true}>
      {contentType || 'All'} {__('tags')}&nbsp;
      {`(${total || 0})`}
    </Title>
  );
  const actionBar = (
    <Wrapper.ActionBar left={title} right={actionBarRight} wideSpacing={true} />
  );

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
              type={tagType}
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
          queryParams={{ tagType }}
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
      leftSidebar={<Sidebar types={types} type={tagType} />}
      transparent={true}
      hasBorder={true}
      footer={<Pagination count={!loading ? total : 0} />}
    />
  );
}

export default List;
