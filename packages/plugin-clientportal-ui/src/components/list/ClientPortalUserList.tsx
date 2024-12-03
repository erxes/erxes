import { Alert, confirm, router } from '@erxes/ui/src/utils';
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { BarItems } from '@erxes/ui/src/layout/styles';
import Button from '@erxes/ui/src/components/Button';
import ClientPortalUserForm from '../../containers/ClientPortalUserForm';
import ClientPortalUserRow from './ClientPortalUserRow';
import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
import { EMPTY_CONTENT_CONTACTS } from '@erxes/ui-settings/src/constants';
import EmptyContent from '@erxes/ui/src/components/empty/EmptyContent';
import FormControl from '@erxes/ui/src/components/form/Control';
import { IClientPortalUser } from '../../types';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import Pagination from '@erxes/ui/src/components/pagination/Pagination';
import Sidebar from './Sidebar';
import Table from '@erxes/ui/src/components/table';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { __ } from '@erxes/ui/src/utils/core';
import { menuContacts } from '@erxes/ui/src/utils/menus';
import withTableWrapper from '@erxes/ui/src/components/table/withTableWrapper';
import ClientPortalMoveForm from '../../containers/ClientPortalMoveForm';

interface IProps {
  type: string;
  kind: 'client' | 'vendor';
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

const ClientportalUserList: React.FC<IProps> = ({
  type,
  kind,
  queryParams,
  clientPortalUsers,
  clientPortalUserCount,
  bulk,
  isAllSelected,
  emptyBulk,
  toggleBulk,
  toggleAll,
  loading,
  searchValue,
  removeUsers,
  verifyUsers,
}) => {
  const location = useLocation();
  const navigate = useNavigate();

  const [state, setState] = useState({
    searchValue: searchValue,
  });

  useEffect(() => {
    setState((prevState) => ({ ...prevState, searchValue }));
  }, [searchValue]);

  const timerRef = React.useRef<NodeJS.Timeout | null>(null);

  const onChange = () => {
    toggleAll(clientPortalUsers, 'clientPortalUsers');
  };

  const removeUsersHandler = (clientPortalUsersToRemove: any[]) => {
    const clientPortalUserIds: string[] = [];

    clientPortalUsersToRemove.forEach((cpUser: any) => {
      clientPortalUserIds.push(cpUser._id);
    });

    removeUsers({ clientPortalUserIds }, emptyBulk);
  };

  const verifyUsersHandler = (userType: string, usersToVerify: any[]) => {
    verifyUsers(
      userType,
      usersToVerify.map((cpUser) => cpUser._id)
    );
  };

  const renderContent = () => {
    const { page = 1, perPage = 20 } = queryParams;

    return (
      <withTableWrapper.Wrapper>
        <Table
          $whiteSpace="nowrap"
          $hover={true}
          $bordered={true}
          $responsive={true}
          $wideHeader={true}
        >
          <thead>
            <tr>
              <th>
                <FormControl
                  checked={isAllSelected}
                  componentclass="checkbox"
                  onChange={onChange}
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
              <th>{__('Modified at')}</th>
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
              />
            ))}
          </tbody>
        </Table>
      </withTableWrapper.Wrapper>
    );
  };

  const searchHandler = (e) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    const searchValue = e.target.value;

    setState((prevState) => ({ ...prevState, searchValue }));

    timerRef.current = setTimeout(() => {
      router.removeParams(navigate, location, 'page');
      router.setParams(navigate, location, { searchValue });
    }, 500);
  };

  const moveCursorAtTheEnd = (e) => {
    const tmpValue = e.target.value;

    e.target.value = '';
    e.target.value = tmpValue;
  };

  const addTrigger = (
    <Button btnStyle="success" size="small" icon="plus-circle">
      Add user
    </Button>
  );

  const moveTrigger = (
    <Button btnStyle="default" size="small" icon="plus-circle">
      Move user
    </Button>
  );

  const customerForm = (props) => {
    return <ClientPortalUserForm {...props} size="lg" kind={kind} />;
  };

  const moveForm = (props) => {
    return <ClientPortalMoveForm {...props} size="sm" kind={kind} />;
  };

  const actionBarRight = (
    <BarItems>
      <FormControl
        type="text"
        placeholder={__('Type to search')}
        onChange={searchHandler}
        value={state.searchValue}
        autoFocus={true}
        onFocus={moveCursorAtTheEnd}
      />

      <ModalTrigger
        title="Move user"
        autoOpenKey="showCustomerModal"
        trigger={moveTrigger}
        content={moveForm}
        backDrop="static"
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
    const removeUsersClickHandler = () => {
      confirm()
        .then(() => {
          removeUsersHandler(bulk);
        })
        .catch((e) => {
          Alert.error(e.message);
        });
    };

    const verifyUsersClickHandler = (
      e: React.MouseEvent<HTMLButtonElement>
    ) => {
      const userType = e.currentTarget.id;
      confirm(
        `This action forces the ${
          bulk.length > 1 ? "users'" : "user's"
        }  ${userType} to be verified. Do you want to continue?`
      )
        .then(() => {
          verifyUsersHandler(userType, bulk);
        })
        .catch((error) => {
          Alert.error(error.message);
        });
    };

    actionBarLeft = (
      <BarItems>
        <Button
          btnStyle="danger"
          size="small"
          icon="times-circle"
          onClick={removeUsersClickHandler}
        >
          Remove
        </Button>
        <Button
          id="phone"
          btnStyle="default"
          size="small"
          icon="check-circle"
          onClick={verifyUsersClickHandler}
        >
          Verify user phone
        </Button>

        <Button
          id="email"
          btnStyle="default"
          size="small"
          icon="check-circle"
          onClick={verifyUsersClickHandler}
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
            byType: { byType: 0 },
          }}
          kind={kind}
        />
      }
      content={
        <DataWithLoader
          data={renderContent()}
          loading={loading}
          count={clientPortalUserCount}
          emptyContent={<EmptyContent content={EMPTY_CONTENT_CONTACTS} />}
        />
      }
      transparent={true}
      hasBorder={true}
    />
  );
};

export default ClientportalUserList;
