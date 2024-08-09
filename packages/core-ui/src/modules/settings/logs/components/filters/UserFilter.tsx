import { FieldStyle, SidebarList } from "@erxes/ui/src/layout/styles";
import { __, router } from "@erxes/ui/src/utils";

import Box from "@erxes/ui/src/components/Box";
import Button from "@erxes/ui/src/components/Button";
import { CustomPadding } from "@erxes/ui-contacts/src/customers/styles";
import DataWithLoader from "@erxes/ui/src/components/DataWithLoader";
import { FormControl } from "@erxes/ui/src/components/form";
import { IUser } from "@erxes/ui/src/auth/types";
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

interface IProps {
  users: IUser[];
  loading: boolean;
  loadMore: () => void;
  all: number;
  queryParams: Record<string, string>;
}

function Users({ users = [], loading, loadMore, all, queryParams }: IProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const timerRef = React.useRef<number | null>(null);
  const [searchValue, setSearchValue] = React.useState(
    queryParams.searchUser || ""
  );

  const [disableLoadMoreBtn, setDisableLoadMoreBtn] = React.useState(false);

  React.useEffect(() => {
    if (queryParams.userId) {
      setDisableLoadMoreBtn(true);
    }
  }, []);

  const onClick = (userId) => {
    router.setParams(navigate, location, { userId });
  };

  const search = (e) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    const inputValue = e.target.value;

    setSearchValue(inputValue);
    setDisableLoadMoreBtn(true);

    if (inputValue === "") {
      setDisableLoadMoreBtn(false);
    }
    timerRef.current = window.setTimeout(() => {
      router.setParams(navigate, location, { searchUser: inputValue });
    }, 500);
  };

  const moveCursorAtTheEnd = (e) => {
    const tmpValue = e.target.value;

    e.target.value = "";
    e.target.value = tmpValue;
  };

  const renderUsers = () => {
    return users.map((user) => {
      return (
        <li key={user._id}>
          <a
            href="#filter"
            tabIndex={0}
            className={
              router.getParam(location, "userId") === user._id ? "active" : ""
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
          icon={loading ? "icon-loading" : "angle-double-down"}
        >
          {loading ? "Loading..." : "Load more"}
        </Button>
      ) : null}
    </SidebarList>
  );

  return (
    <Box
      title={__("Filter by User")}
      name="showFilterByUser"
      isOpen={queryParams.userId ? true : false}
    >
      <CustomPadding>
        <FormControl
          type="text"
          onChange={search}
          placeholder={__("Type to search")}
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

export default Users;
