
import { EMPTY_CONTENT_POPUPS } from '@erxes/ui-settings/src/constants';
import { ITag } from '@erxes/ui-tags/src/types';
import Button from '@erxes/ui/src/components/Button';
import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
import EmptyContent from '@erxes/ui/src/components/empty/EmptyContent';
import FormControl from '@erxes/ui/src/components/form/Control';
import Pagination from '@erxes/ui/src/components/pagination/Pagination';
import { BarItems } from '@erxes/ui/src/layout/styles';
import { Flex } from '@erxes/ui/src/styles/main';
import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Row from './Row';

import TaggerPopover from '@erxes/ui-tags/src/components/TaggerPopover';
import { TAG_TYPES } from '@erxes/ui-tags/src/constants';
import SortHandler from '@erxes/ui/src/components/SortHandler';
import Table from '@erxes/ui/src/components/table';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';

import { IForm } from '@erxes/ui-forms/src/forms/types';
import { __, router } from '../../../common/utils';
import Sidebar from './Sidebar';

type Props = {
  forms: IForm[];
  tags: ITag[];
  bulk: IForm[];
  isAllSelected: boolean;
  emptyBulk: () => void;
  totalCount: number;
  queryParams: any;
  tagsCount: { [key: string]: number };
  toggleBulk: (target: IForm, toAdd: boolean) => void;
  toggleAll: (bulk: IForm[], name: string) => void;
  loading: boolean;
  remove: (formId: string) => void;
  archive: (formId: string, status: boolean) => void;
  refetch?: () => void;
  copy: (formId: string) => void;
  counts: any;
  location: any;
  navigate: any;
};

const List = ({
  forms,
  bulk,
  isAllSelected,
  emptyBulk,
  totalCount,
  queryParams,
  toggleBulk,
  toggleAll,
  loading,
  remove,
  archive,
  copy,
  counts,
  location,
  navigate,
}: Props) => {
  const [searchParams] = useSearchParams();

  const showInstallCode = searchParams.get('showInstallCode');

  const onChange = () => {
    toggleAll(forms, 'forms');
  };

  const renderRow = () => {
    return forms.map((form) => (
      <Row
        key={form._id}
        isChecked={bulk.includes(form)}
        toggleBulk={toggleBulk}
        form={form}
        remove={remove}
        archive={archive}
        showCode={form._id === showInstallCode}
        copy={copy}
      />
    ));
  };

  const searchHandler = (event) => {
    router.setParams(navigate, location, { searchValue: event.target.value });
  };

  let actionBarLeft: React.ReactNode;

  if (bulk.length > 0) {
    const tagButton = (
      <Button btnStyle='simple' size='small' icon='tag-alt'>
        Tag
      </Button>
    );

    actionBarLeft = (
      <BarItems>
        <TaggerPopover
          type={TAG_TYPES.FORM}
          successCallback={emptyBulk}
          targets={bulk}
          trigger={tagButton}
        />
      </BarItems>
    );
  }

  const actionBarRight = (
    <Flex>
      <FormControl
        type='text'
        placeholder={__('Type to search')}
        onChange={searchHandler}
        value={queryParams?.searchValue}
        autoFocus={true}
      />
      &nbsp;&nbsp;
      <Link to='/forms/leads/create'>
        <Button btnStyle='success' size='small' icon='plus-circle'>
          Create Lead
        </Button>
      </Link>
    </Flex>
  );

  const actionBar = (
    <Wrapper.ActionBar right={actionBarRight} left={actionBarLeft} />
  );

  const content = (
    <Table $whiteSpace='nowrap' $hover={true}>
      <thead>
        <tr>
          <th>
            <FormControl
              componentclass='checkbox'
              checked={isAllSelected}
              onChange={onChange}
            />
          </th>
          <th>
            <SortHandler sortField={'name'} label={__('Name')} />
          </th>
          <th>{__('Status')}</th>
          <th>
            <SortHandler sortField={'leadData.viewCount'} label={__('Views')} />
          </th>
          <th>
            <SortHandler
              sortField={'leadData.conversionRate'}
              label={__('Conversion rate')}
            />
          </th>
          <th>
            <SortHandler
              sortField={'leadData.contactsGathered'}
              label={__('Contacts gathered')}
            />
          </th>
          <th>{__('Brand')}</th>
          <th>{__('Created by')}</th>
          <th>
            <SortHandler sortField={'createdDate'} label={__('Created at')} />
          </th>
          <th>{__('Tags')}</th>

          <th>{__('Actions')}</th>
        </tr>
      </thead>
      <tbody>{renderRow()}</tbody>
    </Table>
  );

  return (
    <Wrapper
      header={
        <Wrapper.Header
          title={__('Leads')}
          breadcrumb={[
            { title: __('Forms'), link: '/forms' },
            { title: __('Leads') },
          ]}
          queryParams={queryParams}
        />
      }
      leftSidebar={<Sidebar counts={counts || {}} />}
      actionBar={actionBar}
      footer={<Pagination count={totalCount} />}
      content={
        <DataWithLoader
          data={content}
          loading={loading}
          count={forms.length}
          emptyContent={
            <EmptyContent content={EMPTY_CONTENT_POPUPS} maxItemWidth='360px' />
          }
        />
      }
      hasBorder={true}
      transparent={true}
    />
  );
};

export default List;
