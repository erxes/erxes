import { Alert, confirm, router } from '@erxes/ui/src/utils';

import { BarItems } from '@erxes/ui/src/layout/styles';
import Button from '@erxes/ui/src/components/Button';
import ClientPortalUserForm from '../../containers/ClientPortalUserForm';
import ClientPortalUserRow from './ClientPortalUserRow';
import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
import { EMPTY_CONTENT_CONTACTS } from '@erxes/ui-settings/src/constants';
import EmptyContent from '@erxes/ui/src/components/empty/EmptyContent';
import FormControl from '@erxes/ui/src/components/form/Control';
import { IClientPortalUser } from '../../types';
import { IRouterProps } from '@erxes/ui/src/types';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import Pagination from '@erxes/ui/src/components/pagination/Pagination';
import React from 'react';
import Sidebar from './Sidebar';
import Table from '@erxes/ui/src/components/table';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { __ } from '@erxes/ui/src/utils/core';
import { menuContacts } from '@erxes/ui/src/utils/menus';
import withTableWrapper from '@erxes/ui/src/components/table/withTableWrapper';

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
  toggleAll: (targets: IClientPortalUser[], containerId: string) => void;
  loading: boolean;
  searchValue: string;
  removeUsers: (
    doc: { clientPortalUserIds: string[] },
    emptyBulk: () => void
  ) => void;
  verifyUsers: (type: string, userIds: string[]) => void;
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

  onChange = () => {
    const { toggleAll, clientPortalUsers } = this.props;

    toggleAll(clientPortalUsers, 'clientPortalUsers');
  };

  removeUsers = clientPortalUsers => {
    const clientPortalUserIds: string[] = [];

    clientPortalUsers.forEach((cpUser: any) => {
      clientPortalUserIds.push(cpUser._id);
    });

    const { removeUsers, emptyBulk } = this.props;

    removeUsers({ clientPortalUserIds }, emptyBulk);
  };

  verifyUsers = (type, clientPortalUsers) => {
    this.props.verifyUsers(
      type,
      clientPortalUsers.map(cpUser => cpUser._id)
    );
  };

  renderContent() {
    const {
      isAllSelected,
      clientPortalUsers,
      toggleBulk,
      bulk,
      history,
      queryParams
    } = this.props;

    const { page = 1, perPage = 20 } = queryParams;

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
                  onChange={this.onChange}
                />
              </th>
              <th>#</th>
              <th>{__('ID Verification')}</th>
              <th>{__('Email')}</th>
              <th>{__('Phone')}</th>
              <th>{__('User Name')}</th>
              <th>{__('Code')}</th>
              <th>{__('First Name')}</th>
              <th>{__('Last Name')}</th>
              <th>{__('Company name')}</th>
              <th>{__('Type')}</th>
              <th>{__('from')}</th>
              <th>{__('Status')}</th>
              <th>{__('Session count')}</th>
              <th>{__('Last seen at')}</th>
              <th>{__('Registered at')}</th>
            </tr>
          </thead>
          <tbody id="clientPortalUsers">
            {(clientPortalUsers || []).map((clientPortalUser, i) => (
              <ClientPortalUserRow
                index={(page - 1) * perPage + i + 1}
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

  search = e => {
    if (this.timer) {
      clearTimeout(this.timer);
    }

    const { history } = this.props;
    const searchValue = e.target.value;

    this.setState({ searchValue });

    this.timer = setTimeout(() => {
      router.removeParams(history, 'page');
      router.setParams(history, { searchValue });
    }, 500);
  };

  moveCursorAtTheEnd(e) {
    const tmpValue = e.target.value;

    e.target.value = '';
    e.target.value = tmpValue;
  }

  render() {
    const {
      clientPortalUserCount,
      queryParams,
      loading,
      type,
      bulk,
      clientPortalUsers
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
          onChange={this.search}
          value={this.state.searchValue}
          autoFocus={true}
          onFocus={this.moveCursorAtTheEnd}
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

    let actionBarLeft: React.ReactNode;

    if (bulk.length > 0) {
      const onClick = () =>
        confirm()
          .then(() => {
            this.removeUsers(bulk);
          })
          .catch(e => {
            Alert.error(e.message);
          });

      const onClickConfirm = e => {
        const kind = e.currentTarget.id;
        confirm(
          `This action forces the ${
            bulk.length > 1 ? "users'" : "user's"
          }  ${kind} to be verified. Do you want to continue?`
        )
          .then(() => {
            this.verifyUsers(kind, bulk);
          })
          .catch(error => {
            Alert.error(error.message);
          });
      };

      actionBarLeft = (
        <BarItems>
          <Button
            btnStyle="danger"
            size="small"
            icon="times-circle"
            onClick={onClick}
          >
            Remove
          </Button>
          <Button
            id="phone"
            btnStyle="default"
            size="small"
            icon="check-circle"
            onClick={onClickConfirm}
          >
            Verify user phone
          </Button>

          <Button
            id="email"
            btnStyle="default"
            size="small"
            icon="check-circle"
            onClick={onClickConfirm}
          >
            Verify user email
          </Button>
        </BarItems>
      );
    }

    const actionBar = (
      <Wrapper.ActionBar right={actionBarRight} left={actionBarLeft} />
    );

    return (
      <Wrapper
        header={
          <Wrapper.Header
            title={__(`ClientPortal Users` + ` (${clientPortalUserCount})`)}
            queryParams={queryParams}
            submenu={menuContacts}
          />
        }
        actionBar={actionBar}
        footer={<Pagination count={clientPortalUserCount} />}
        leftSidebar={
          <Sidebar
            loadingMainQuery={loading}
            counts={{
              byCP: { byCP: clientPortalUserCount },
              byType: { byType: 0 }
            }}
          />
        }
        content={
          <DataWithLoader
            data={this.renderContent()}
            loading={loading}
            count={clientPortalUserCount}
            emptyContent={<EmptyContent content={EMPTY_CONTENT_CONTACTS} />}
          />
        }
        transparent={true}
        hasBorder={true}
      />
    );
  }
}

export default ClientportalUserList;
