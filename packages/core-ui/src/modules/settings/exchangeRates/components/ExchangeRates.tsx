import { LeftActionBar, Title } from '@erxes/ui-settings/src/styles';
import { __, router } from '@erxes/ui/src/utils';

import ActionButtons from '@erxes/ui/src/components/ActionButtons';
import { BarItems } from 'modules/layout/styles';
import Button from 'modules/common/components/Button';
import DataWithLoader from 'modules/common/components/DataWithLoader';
import FormControl from 'modules/common/components/form/Control';
import Icon from '@erxes/ui/src/components/Icon';
import ModalTrigger from 'modules/common/components/ModalTrigger';
import Pagination from 'modules/common/components/pagination/Pagination';
import React, { useState } from 'react';
import Table from 'modules/common/components/table';
import Tip from '@erxes/ui/src/components/Tip';
import Wrapper from 'modules/layout/components/Wrapper';
import { useLocation, useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { IExchangeRate } from '../types';
import ExchangeRateForm from '../containers/ExchangeRateForm';

type Props = {
  rateList: IExchangeRate[];
  totalCount: number;
  loading: boolean;
  deleteExchangeRates: (rateIds: string[], callback: () => void) => void;
  queryParams: Record<string, string>;
};

const MainList = (props: Props) => {
  const { rateList, loading, totalCount, deleteExchangeRates, queryParams } =
    props;

  let timer;
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [searchValue, setSearchValue] = useState(queryParams.searchValue || '');

  const remove = (_id?: string) => {
    if (_id) {
      deleteExchangeRates([_id], () => setSelectedItems([]));
    } else {
      deleteExchangeRates(selectedItems, () => setSelectedItems([]));
    }
  };

  const renderForm = () => {
    const trigger = (
      <Button btnStyle="success" icon="plus-circle">
        {__('Add Exchange Rate')}
      </Button>
    );

    const content = ({ closeModal }) => (
      <ExchangeRateForm closeModal={closeModal} />
    );

    return (
      <ModalTrigger
        title="Add Exchange Rate"
        content={content}
        trigger={trigger}
      />
    );
  };

  const renderSearch = () => {
    const search = (e) => {
      if (timer) {
        clearTimeout(timer);
      }

      const searchValue = e.target.value;

      setSearchValue(searchValue);

      timer = setTimeout(() => {
        router.removeParams(navigate, location, 'page');
        router.setParams(navigate, location, { searchValue });
      }, 500);
    };

    const moveCursorAtTheEnd = (e) => {
      const tmpValue = e.target.value;

      e.target.value = '';
      e.target.value = tmpValue;
    };

    return (
      <FormControl
        type="text"
        placeholder={__('Type to search')}
        onChange={search}
        value={searchValue}
        autoFocus={true}
        onFocus={moveCursorAtTheEnd}
      />
    );
  };

  const renderEditAction = (exchangeRate: IExchangeRate) => {
    const editTrigger = (
      <Button btnStyle="link">
        <Tip text={__('Edit')} placement="top">
          <Icon icon="edit-3" />
        </Tip>
      </Button>
    );

    const renderForm = ({ closeModal }) => {
      return (
        <ExchangeRateForm exchangeRate={exchangeRate} closeModal={closeModal} />
      );
    };

    return (
      <ModalTrigger
        title="Edit Exchange Rate"
        content={({ closeModal }) => renderForm({ closeModal })}
        trigger={editTrigger}
      />
    );
  };

  const handleSelect = (id: string) => {
    setSelectedItems((prev) => {
      const isSelected = prev.includes(id);
      return isSelected ? prev.filter((item) => item !== id) : [...prev, id];
    });
  };

  const renderRow = (exchangeRate) => {
    const onclick = (e) => {
      e.stopPropagation();
    };

    return (
      <tr key={exchangeRate._id}>
        <td onClick={onclick}>
          <FormControl
            componentclass="checkbox"
            checked={selectedItems.includes(exchangeRate._id)}
            onClick={() => handleSelect(exchangeRate._id)}
          />
        </td>
        <td>{dayjs(exchangeRate.date).format('YYYY-MM-DD')}</td>
        <td>{exchangeRate?.mainCurrency || ''}</td>
        <td>{exchangeRate?.rateCurrency || ''}</td>
        <td>{exchangeRate?.rate || 0}</td>
        <td>
          <ActionButtons>
            {renderEditAction(exchangeRate)}

            <Tip text={__('Delete')} placement="top">
              <Button
                btnStyle="link"
                onClick={() => remove(exchangeRate._id)}
                icon="times-circle"
              />
            </Tip>
          </ActionButtons>
        </td>
      </tr>
    );
  };

  const renderContent = () => {
    const handleSelectAll = () => {
      if (!selectedItems.length) {
        const branchIds = rateList.map((branch) => branch._id);
        return setSelectedItems(branchIds);
      }

      setSelectedItems([]);
    };

    return (
      <Table>
        <thead>
          <tr>
            <th>
              <FormControl
                componentclass="checkbox"
                checked={rateList?.length === selectedItems.length}
                onClick={handleSelectAll}
              />
            </th>
            <th>{__('Date')}</th>
            <th>{__('Main Currency')}</th>
            <th>{__('Rate Currency')}</th>
            <th>{__('Rate')}</th>
          </tr>
        </thead>
        <tbody>{rateList.map((rate) => renderRow(rate))}</tbody>
      </Table>
    );
  };

  const rightActionBar = (
    <BarItems>
      {renderSearch()}
      {renderForm()}
    </BarItems>
  );

  const leftActionBar = selectedItems.length > 0 && (
    <Button
      btnStyle="danger"
      size="small"
      icon="times-circle"
      onClick={() => remove()}
    >
      Remove
    </Button>
  );

  return (
    <Wrapper
      header={
        <Wrapper.Header
          title="Exchange Rates"
          breadcrumb={[
            { title: __('Settings'), link: '/settings' },
            { title: __('Exchange Rates'), link: '/settings/exchangeRates' },
          ]}
        />
      }
      actionBar={
        <Wrapper.ActionBar
          left={
            <LeftActionBar>
              <Title $capitalize={true}>
                {__('Exchange Rates')}&nbsp;
                {`(${totalCount || 0})`}
              </Title>
              {leftActionBar}
            </LeftActionBar>
          }
          right={rightActionBar}
        />
      }
      content={
        <DataWithLoader
          loading={loading}
          count={totalCount || 0}
          data={renderContent()}
          emptyImage="/images/actions/5.svg"
          emptyText="No Exchange Rates"
        />
      }
      footer={<Pagination count={totalCount || 0} />}
      hasBorder={true}
    />
  );
};

export default MainList;
