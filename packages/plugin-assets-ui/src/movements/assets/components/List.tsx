import {
  BarItems,
  Button,
  FormControl,
  ModalTrigger,
  router,
  Table,
  __,
  DataWithLoader,
  Wrapper,
  Pagination,
  Icon,
} from '@erxes/ui/src';
import React, { useState, useRef } from 'react';
import { menuMovements } from '../../../common/constant';
import { IMovementItem } from '../../../common/types';
import { DefaultWrapper } from '../../../common/utils';
import { InputBar, Title, FlexItem } from '@erxes/ui-settings/src/styles';
import Form from '../../movements/containers/Form';
import Row from './Row';
import Sidebar from './Sidebar';

type Props = {
  items: IMovementItem[];
  totalCount: number;
  history: any;
  queryParams: any;
  loading: boolean;
};

const List = (props: Props) => {
  const { items, totalCount, history, queryParams, loading } = props;

  const [searchValue, setSearchValue] = useState(queryParams.searchValue || '');
  const timerRef = useRef<number | null>(null);

  const handleSearch = (e) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    const searchValue = e.target.value;
    setSearchValue(searchValue);

    timerRef.current = window.setTimeout(() => {
      router.removeParams(history, 'page');
      router.setParams(history, { searchValue });
    }, 500);
  };

  const moveCursorAtTheEnd = (e) => {
    const tmpValue = e.target.value;

    e.target.value = '';
    e.target.value = tmpValue;
  };

  const renderFormContent = (formProps) => {
    const updatedProps = {
      ...formProps,
      queryParams: queryParams || {},
    };

    return <Form {...updatedProps} />;
  };

  const renderForm = () => {
    const trigger = (
      <Button btnStyle="success" icon="plus-circle">
        Add Movement
      </Button>
    );

    return (
      <ModalTrigger
        title="Add Movement"
        content={renderFormContent}
        trigger={trigger}
        size="xl"
      />
    );
  };

  const renderRow = () => {
    return items.map((movement) => (
      <Row key={movement._id} item={movement} queryParams={queryParams} />
    ));
  };

  const renderContent = () => {
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
        <tbody>{renderRow()}</tbody>
      </Table>
    );
  };

  const renderActionBar = () => {
    const leftActionBar = <Title>{__('Asset Items')}</Title>;

    const rightActionBar = (
      <BarItems>
        <InputBar type="searchBar">
          <Icon icon="search-1" size={20} />
          <FlexItem>
            <FormControl
              type="text"
              placeholder={__('Type to search')}
              onChange={handleSearch}
              value={searchValue}
              autoFocus={true}
              onFocus={moveCursorAtTheEnd}
            />
          </FlexItem>
        </InputBar>
        {renderForm()}
      </BarItems>
    );

    return <Wrapper.ActionBar left={leftActionBar} right={rightActionBar} />;
  };

  return (
    <Wrapper
      header={
        <Wrapper.Header
          title={'Asset Movement Items'}
          submenu={menuMovements}
        />
      }
      actionBar={renderActionBar()}
      content={
        <DataWithLoader
          loading={loading || false}
          data={renderContent()}
          count={totalCount}
          emptyImage="/images/actions/5.svg"
          emptyText={__('No data')}
        />
      }
      hasBorder={true}
      leftSidebar={<Sidebar history={history} queryParams={queryParams} />}
      footer={<Pagination count={totalCount} />}
    />
  );
};

export default List;
