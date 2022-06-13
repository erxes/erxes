import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
import EmptyContent from '@erxes/ui/src/components/empty/EmptyContent';
import FormControl from '@erxes/ui/src/components/form/Control';
import Pagination from '@erxes/ui/src/components/pagination/Pagination';
import SortHandler from '@erxes/ui/src/components/SortHandler';
import Table from '@erxes/ui/src/components/table';
import withTableWrapper from '@erxes/ui/src/components/table/withTableWrapper';
import { menuContacts } from '@erxes/ui/src/utils/menus';
import * as routerUtils from '@erxes/ui/src/utils/router';
import { EMPTY_CONTENT_CONTACTS } from '@erxes/ui-settings/src/constants';
import React from 'react';
import { withRouter } from 'react-router-dom';
import { IRouterProps } from '@erxes/ui/src/types';
import { __ } from 'coreui/utils';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { IConfigColumn } from '@erxes/ui-settings/src/properties/types';
import Sidebar from './Sidebar';
import { BarItems } from '@erxes/ui/src/layout/styles';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import Button from '@erxes/ui/src/components/Button';
import ClientPortalUserForm from '../../containers/ClientPortalUserForm';

interface IProps extends IRouterProps {
  type: string;
  totalCount: number;
  bulk: any[];
  isAllSelected: boolean;
  emptyBulk: () => void;
  loading: boolean;
  searchValue: string;
  queryParams: any;
  refetch?: () => void;
  isExpand?: boolean;
  page: number;
  perPage: number;
}

type State = {
  searchValue?: string;
  searchType?: string;
  showDropDown?: boolean;
};

class ClientportalUserList extends React.Component<IProps, State> {
  private timer?: NodeJS.Timer;

  constructor(props) {
    super(props);

    this.state = {
      searchValue: this.props.searchValue
    };
  }

  renderContent() {
    const { isAllSelected } = this.props;

    return (
      <withTableWrapper.Wrapper>
        <Table
          whiteSpace="nowrap"
          hover={true}
          bordered={true}
          responsive={true}
          wideHeader={true}
        >
          <thead>
            <tr>
              <th>
                <FormControl
                  checked={isAllSelected}
                  componentClass="checkbox"
                />
              </th>
              <th>{__('First Name')}</th>
              <th>{__('Last Name')}</th>
              <th>{__('User Name')}</th>
              <th>{__('Email')}</th>
              <th>{__('Created date')}</th>
            </tr>
          </thead>
          {/* <tbody id="clientPortalUsers">
            {(clientPortalUsers || []).map((clientPortalUsers, i) => (
              <CLientPortalUsersRow
                index={(page - 1) * perPage + i + 1}
                clientPortalUsers={clientPortalUsers}
                key={clientPortalUsers._id}
                isChecked={bulk.includes(clientPortalUsers)}
                toggleBulk={toggleBulk}
                history={history}
              />
            ))}
          </tbody> */}
        </Table>
      </withTableWrapper.Wrapper>
    );
  }

  render() {
    const {
      type,
      totalCount,
      bulk,
      emptyBulk,
      loading,
      location,
      history,
      queryParams
    } = this.props;

    const addTrigger = (
      <Button btnStyle="success" size="small" icon="plus-circle">
        Add user
      </Button>
    );

    const customerForm = props => {
      return <ClientPortalUserForm {...props} size="lg" />;
    };

    const actionBarRight = (
      <BarItems>
        <FormControl
          type="text"
          placeholder={__('Type to search')}
          // onChange={this.search}
          // value={this.state.searchValue}
          autoFocus={true}
          // onFocus={this.moveCursorAtTheEnd}
        />

        <ModalTrigger
          title="New user"
          autoOpenKey="showCustomerModal"
          trigger={addTrigger}
          size="lg"
          content={customerForm}
          backDrop="static"
        />
      </BarItems>
    );

    const actionBar = <Wrapper.ActionBar right={actionBarRight} />;

    return (
      <Wrapper
        header={
          <Wrapper.Header
            title={__(`ClientPortal Users`)}
            queryParams={queryParams}
            submenu={menuContacts}
          />
        }
        actionBar={actionBar}
        // footer={<Pagination count={totalCount} />}
        // leftSidebar={<Sidebar loadingMainQuery={loading} type={type} />}
        content={
          <DataWithLoader
            data={this.renderContent()}
            loading={false}
            // count={0}
            emptyContent={<EmptyContent content={EMPTY_CONTENT_CONTACTS} />}
          />
        }
      />
    );
  }
}

export default withTableWrapper('Customer', withRouter(ClientportalUserList));
