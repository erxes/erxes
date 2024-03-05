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
import LoanCheckForm from '../../SyncForm/Form';
interface IProps extends IRouterProps {
  syncHistories: any[];
  loading: boolean;
  totalCount: number;
  history: any;
  queryParams: any;
  toSyncLoans: (action: string, toSyncSavings: any[]) => void;
  toCheckLoans: () => void;
  items: any;
}

class Loan extends React.Component<IProps> {
  render() {
    const {
      history,
      syncHistories,
      totalCount,
      loading,
      queryParams,
      items,
      toSyncLoans,
      toCheckLoans,
    } = this.props;

    const tablehead = ['Date', 'Number', 'Status', 'Content', 'Error'];
    const formHead = ['Number', 'Status', 'Start Date', 'End Date'];
    const onClickCheck = (e) => {
      e.stopPropagation();
      this.props.toCheckLoans();
    };

    const checkButton = (
      <Button btnStyle="warning" icon="check-circle" onMouseDown={onClickCheck}>
        Check
      </Button>
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
        <tbody id="loans">
          {(syncHistories || []).map((loanAcnt) => (
            <tr key={loanAcnt._id}>
              <td>{dayjs(loanAcnt.createdAt).format('lll')}</td>
              <td>{loanAcnt.consumeData?.object?.number}</td>
              <td>{loanAcnt.consumeData?.object?.status}</td>
              <td>{loanAcnt.content}</td>
              <td>
                {(loanAcnt.responseStr || '').includes('timedout')
                  ? loanAcnt.responseStr
                  : `
                      ${loanAcnt.responseData?.extra_info?.warnings || ''}
                      ${loanAcnt.responseData?.message || ''}
                      ${loanAcnt.error || ''}
                  `}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    );
    const loanCheckForm = () => {
      const content = (props) => {
        return (
          <LoanCheckForm
            items={items?.loanContracts?.items}
            toCheck={toCheckLoans}
            toSync={toSyncLoans}
            tablehead={formHead}
            type="acnt"
            {...props}
          />
        );
      };
      return <Bulk content={content} />;
    };
    const actionBarRight = (
      <ModalTrigger
        title={`${__('Loans Account')}`}
        trigger={checkButton}
        autoOpenKey="showLoanModal"
        size="xl"
        content={loanCheckForm}
        backDrop="static"
      />
    );

    const actionBar = (
      <Wrapper.ActionBar
        left={<Title>{__(`loan accounts (${totalCount})`)}</Title>}
        right={actionBarRight}
        background="colorWhite"
        wideSpacing={true}
      />
    );

    return (
      <Wrapper
        header={
          <Wrapper.Header
            title={__(`loan Account`)}
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

export default Loan;
