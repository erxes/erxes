import { FieldStyle, SidebarList } from '@erxes/ui/src/layout/styles';
import { __, router } from 'coreui/utils';
import Button from '@erxes/ui/src/components/Button';
import Box from '@erxes/ui/src/components/Box';
import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
import { IRouterProps } from '@erxes/ui/src/types';
import React from 'react';
import { withRouter } from 'react-router-dom';
import { FormControl } from '@erxes/ui/src/components/form';
import { CustomPadding } from '@erxes/ui-contacts/src/customers/styles';
import { IUser } from '@erxes/ui/src/auth/types';

interface IProps extends IRouterProps {
  users: IUser[];
  loading: boolean;
  loadMore: () => void;
  history: any;
  all: number;
  queryParams: any;
}

function Users({
  history,
  users = [],
  loading,
  loadMore,
  all,
  queryParams
}: IProps) {
  const timerRef = React.useRef<number | null>(null);
  const [searchValue, setSearchValue] = React.useState(
    queryParams.searchUser || ''
  );

  const [disableLoadMoreBtn, setDisableLoadMoreBtn] = React.useState(false);

  React.useEffect(() => {
    if (queryParams.userId) {
      setDisableLoadMoreBtn(true);
    }
  }, []);

  const onClick = userId => {
    router.setParams(history, { userId });
    router.removeParams(history, 'page');
  };

  const search = e => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    const inputValue = e.target.value;

    setSearchValue(inputValue);
    setDisableLoadMoreBtn(true);

    if (inputValue === '') {
      setDisableLoadMoreBtn(false);
    }
    timerRef.current = window.setTimeout(() => {
      router.setParams(history, { searchUser: inputValue });
    }, 500);
  };

  const moveCursorAtTheEnd = e => {
    const tmpValue = e.target.value;

    e.target.value = '';
    e.target.value = tmpValue;
  };

  const renderUsers = () => {
    return users.map(user => {
      return (
        <li key={user._id}>
          <a
            href="#filter"
            tabIndex={0}
            className={
              router.getParam(history, 'userId') === user._id ? 'active' : ''
            }
            onClick={onClick.bind(null, user._id)}
          >
            <FieldStyle>{user.email}</FieldStyle>
          </a>
        </li>
      );
    });
  };

  const data = (
    <SidebarList>
      {renderUsers()}

      {all !== users.length && !disableLoadMoreBtn ? (
        <Button
          block={true}
          btnStyle="link"
          onClick={loadMore}
          icon={loading ? 'icon-loading' : 'angle-double-down'}
        >
          {loading ? 'Loading...' : 'Load more'}
        </Button>
      ) : null}
    </SidebarList>
  );

  return (
    <Box
      title={__('Filter by User')}
      name="showFilterByUser"
      isOpen={queryParams.userId}
    >
      <CustomPadding>
        <FormControl
          type="text"
          onChange={search}
          placeholder={__('Type to search')}
          value={searchValue}
          onFocus={moveCursorAtTheEnd}
        />
      </CustomPadding>
      <DataWithLoader
        data={data}
        loading={loading}
        count={users.length}
        emptyText="Search and filter logs by users"
        emptyIcon="monitor"
        size="small"
        objective={true}
      />
    </Box>
  );
}

export default withRouter<IProps>(Users);
