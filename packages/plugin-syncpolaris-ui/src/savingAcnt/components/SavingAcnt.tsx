import React from 'react';
import { IRouterProps } from '@erxes/ui/src/types';
import {
  __,
  Wrapper,
  DataWithLoader,
  Pagination,
  Table,
  Button,
  Bulk,
  ModalTrigger,
} from '@erxes/ui/src';
import Sidebar from '../../search/Sidebar';
import { menuSyncpolaris } from '../../constants';
import { Title } from '@erxes/ui-settings/src/styles';
import dayjs from 'dayjs';
import SavingCheckForm from '../../SyncForm/Form';
interface IProps extends IRouterProps {
  toSync: (type: string, toSync: any[]) => void;
  syncHistories: any[];
  loading: boolean;
  totalCount: number;
  history: any;
  queryParams: any;
  toCheck: (type: string) => void;
  items: any;
}
class SavingAcnt extends React.Component<IProps> {
  render() {
    const {
      history,
      syncHistories,
      totalCount,
      loading,
      queryParams,
      items,
      toCheck,
      toSync,
    } = this.props;
    const tablehead = ['Date', 'Contant number', 'Status', 'Deposit', 'Error'];
    const formhead = ['Number', 'Status', 'Start Date', 'End Date'];
    const onCheckSaving = (e) => {
      e.stopPropagation();
      this.props.toCheck('savingAcnt');
    };
    const checkButton = (
      <Button
        btnStyle="warning"
        icon="check-circle"
        onMouseDown={onCheckSaving}
      >
        Check
      </Button>
    );

    const savinCheckForm = () => {
      const content = (props) => {
        return (
          <SavingCheckForm
            items={items}
            toSync={toSync}
            toCheck={toCheck}
            tablehead={formhead}
            type={'savingAcnt'}
            {...props}
          />
        );
      };
      return <Bulk content={content} />;
    };

    const actionBarRight = (
      <ModalTrigger
        title={`${__('Savings')}`}
        trigger={checkButton}
        autoOpenKey="showSavingModal"
        size="xl"
        content={savinCheckForm}
        backDrop="static"
      />
    );

    const actionBar = (
      <Wrapper.ActionBar
        left={<Title>{__(`Saving accounts (${totalCount})`)}</Title>}
        right={actionBarRight}
        background="colorWhite"
        wideSpacing={true}
      />
    );
    const mainContent = (
      <Table whiteSpace="nowrap" bordered={true} hover={true}>
        <thead>
          <tr>
            {tablehead.map((p) => (
              <th key={p}>{p || ''}</th>
            ))}
          </tr>
        </thead>
        <tbody id="orders">
          {(syncHistories || []).map((saving) => (
            <tr key={saving._id}>
              <td>{dayjs(saving.createdAt).format('lll')}</td>
              <td>{saving.consumeData?.object?.number}</td>
              <td>{saving.consumeData?.object?.status}</td>
              <td>{saving.consumeData?.object?.isDeposit ? 'Deposit' : ''}</td>
              <td>
                {(saving.responseStr || '').includes('timedout')
                  ? saving.responseStr
                  : `
                    ${saving.responseData?.extra_info?.warnings || ''}
                    ${saving.responseData?.message || ''}
                    ${saving.error || ''}
                    ${saving.responseData?.error || ''}
                  `}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    );
    return (
      <Wrapper
        header={
          <Wrapper.Header
            title={__(`saving account`)}
            queryParams={queryParams}
            submenu={menuSyncpolaris}
          />
        }
        leftSidebar={<Sidebar queryParams={queryParams} history={history} />}
        actionBar={actionBar}
        footer={<Pagination count={totalCount || 0} />}
        content={
          <DataWithLoader
            data={mainContent}
            loading={loading}
            count={totalCount || 0}
            emptyImage="/images/actions/1.svg"
          />
        }
        hasBorder={true}
        transparent={true}
      />
    );
  }
}

export default SavingAcnt;
