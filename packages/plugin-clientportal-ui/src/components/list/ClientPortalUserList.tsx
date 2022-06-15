import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
import EmptyContent from '@erxes/ui/src/components/empty/EmptyContent';
import FormControl from '@erxes/ui/src/components/form/Control';
import Pagination from '@erxes/ui/src/components/pagination/Pagination';
import Table from '@erxes/ui/src/components/table';
import withTableWrapper from '@erxes/ui/src/components/table/withTableWrapper';
import { menuContacts } from '@erxes/ui/src/utils/menus';
import { EMPTY_CONTENT_CONTACTS } from '@erxes/ui-settings/src/constants';
import React from 'react';
import { withRouter } from 'react-router-dom';
import { IRouterProps } from '@erxes/ui/src/types';
import { __ } from 'coreui/utils';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import Sidebar from './Sidebar';
import { BarItems } from '@erxes/ui/src/layout/styles';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import Button from '@erxes/ui/src/components/Button';
import ClientPortalUserForm from '../../containers/ClientPortalUserForm';
import { IClientPortalUser } from '../../types';
import ClientPortalUserRow from './ClientPortalUserRow';

interface IProps extends IRouterProps {
  history: any;
  type: string;
  queryParams: any;
  clientPortalUsers: IClientPortalUser[];
  clientPortalUserCount: number;
  bulk: any[];
  isAllSelected: boolean;
  emptyBulk: () => void;
  toggleBulk: () => void;
  loading: boolean;
  searchValue: string;
}

type State = {
  searchValue?: string;
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
    const {
      isAllSelected,
      clientPortalUsers,
      toggleBulk,
      bulk,
      history
    } = this.props;

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
          <tbody id="clientPortalUsers">
            {(clientPortalUsers || []).map((clientPortalUser, i) => (
              <ClientPortalUserRow
                clientPortalUser={clientPortalUser}
                key={clientPortalUser._id}
                isChecked={bulk.includes(clientPortalUser)}
                toggleBulk={toggleBulk}
                history={history}
              />
            ))}
          </tbody>
        </Table>
      </withTableWrapper.Wrapper>
    );
  }

  render() {
    const { clientPortalUserCount, queryParams, loading, type } = this.props;

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
        footer={<Pagination count={clientPortalUserCount} />}
        leftSidebar={<Sidebar loadingMainQuery={loading} type={type} />}
        content={
          <DataWithLoader
            data={this.renderContent()}
            loading={loading}
            count={clientPortalUserCount}
            emptyContent={<EmptyContent content={EMPTY_CONTENT_CONTACTS} />}
          />
        }
      />
    );
  }
}

export default withTableWrapper('Customer', withRouter(ClientportalUserList));
