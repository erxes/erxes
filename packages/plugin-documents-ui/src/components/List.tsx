import {
  FilterContainer,
  FlexItem,
  FlexRow,
  InputBar,
  Title
} from '@erxes/ui-settings/src/styles';
import {
  FormControl,
  ModalTrigger,
  Pagination
} from '@erxes/ui/src/components';

import Button from '@erxes/ui/src/components/Button';
import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
import Form from '../containers/Form';
import Icon from '@erxes/ui/src/components/Icon';
import React from 'react';
import Row from './Row';
import Sidebar from './Sidebar';
import Table from '@erxes/ui/src/components/table';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { __ } from 'coreui/utils';
import { router } from '@erxes/ui/src/utils';

type Props = {
  queryParams: any;
  list: any[];
  totalCount: number;
  contentType: string;
  contentTypes: Array<{
    label: string;
    contentType: string;
    subTypes: string[];
  }>;
  history: any;
  remove: (_id: string) => void;
  loading: boolean;
};

function List({
  queryParams,
  contentType,
  contentTypes,
  list,
  totalCount,
  history,
  remove,
  loading
}: Props) {
  let timer;

  const typeObject = contentTypes.find(
    type => contentType === type.contentType
  );

  const searchHandler = e => {
    if (timer) {
      clearTimeout(timer);
    }

    const inputValue = e.target.value;

    timer = setTimeout(() => {
      router.removeParams(history, 'page');
      router.setParams(history, { searchValue: inputValue });
    }, 500);
  };

  const renderSearch = () => {
    return (
      <InputBar type="searchBar">
        <Icon icon="search-1" size={20} />
        <FlexItem>
          <FormControl
            type="text"
            placeholder={__('Type to search')}
            onChange={searchHandler}
            autoFocus={true}
          />
        </FlexItem>
      </InputBar>
    );
  };

  const modalContent = modalProps => {
    const props = {
      ...modalProps,
      contentType,
      history
    };

    return <Form {...props} />;
  };

  const trigger = (
    <Button btnStyle="success" icon="plus-circle">
      Add Document
    </Button>
  );

  function renderObjects() {
    return list.map(obj => {
      return <Row key={obj._id} obj={obj} remove={remove} />;
    });
  }

  function renderData() {
    return (
      <Table>
        <thead>
          <tr>
            <th>{__('name')}</th>
            <th>{__('Actions')}</th>
          </tr>
        </thead>
        <tbody>{renderObjects()}</tbody>
      </Table>
    );
  }

  function renderContent() {
    return (
      <DataWithLoader
        data={renderData()}
        loading={loading}
        count={list.length}
        emptyText={__('There is no document') + '.'}
        emptyImage="/images/actions/8.svg"
      />
    );
  }

  const actionBarRight = () => {
    return (
      <FilterContainer marginRight={true}>
        <FlexRow>
          {renderSearch()}
          {queryParams.contentType && (
            <ModalTrigger
              content={modalContent}
              size="lg"
              title="Add Document"
              autoOpenKey="showDocumentModal"
              trigger={trigger}
            />
          )}
        </FlexRow>
      </FilterContainer>
    );
  };

  const title = (
    <Title capitalize={true}>
      {__(` ${typeObject?.label || ''} Documents (${totalCount})`)}
    </Title>
  );

  const actionBar = (
    <Wrapper.ActionBar
      left={title}
      right={actionBarRight()}
      wideSpacing={true}
    />
  );

  const sidebar = (
    <Sidebar queryParams={queryParams} contentTypes={contentTypes} />
  );

  const breadcrumb = [
    { title: __('Settings'), link: '/settings' },
    { title: __('Documents'), link: '/settings/documents' }
  ];

  return (
    <Wrapper
      header={
        <Wrapper.Header
          title={__(`Documents`)}
          breadcrumb={breadcrumb}
          queryParams={{ contentType }}
          filterTitle={typeObject?.label || ''}
        />
      }
      actionBar={actionBar}
      content={renderContent()}
      leftSidebar={sidebar}
      footer={<Pagination count={totalCount} />}
      transparent={true}
      hasBorder={true}
    />
  );
}

export default React.memo(List);
