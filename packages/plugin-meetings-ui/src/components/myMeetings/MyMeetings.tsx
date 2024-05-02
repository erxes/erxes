import { __, router } from "@erxes/ui/src/utils";
import React, { useState } from "react";

import Wrapper from "@erxes/ui/src/layout/components/Wrapper";
import DataWithLoader from "@erxes/ui/src/components/DataWithLoader";

import SideBarContainer from "../myMeetings/SideBar";
import { IUser } from "@erxes/ui/src/auth/types";
import { FormControl } from "@erxes/ui/src/components";
import { MeetingsQueryResponse } from "../../types";
import MyMeetingListContainer from "../../containers/myMeetings/List";
import { menuMeeting } from "../../contants";
import { useLocation, useNavigate } from "react-router-dom";

type Props = {
  meetings: any;
  loading: boolean;
  queryParams: any;
  route?: string;
  refetchQueries?: any;
  currentUser: IUser;
  meetingQuery?: MeetingsQueryResponse;
};

function MyMeetings(props: Props) {
  const { loading, queryParams, currentUser } = props;
  const { searchValue } = queryParams;
  const [searchText, setSearchValue] = useState(searchValue);
  const location = useLocation();
  const navigate = useNavigate();

  const searchHandler = (e) => {
    const searchingValue = e.target.value;

    setSearchValue(searchingValue);

    setTimeout(() => {
      router.removeParams(navigate, location, "page");
      router.setParams(navigate, location, { searchValue });
    }, 500);
  };

  const leftSideBar = (
    <SideBarContainer queryParams={queryParams} currentUser={currentUser} />
  );

  const actionBarRight = (
    <FormControl
      type="text"
      placeholder={__("Type to search")}
      defaultValue={searchText}
      onChange={searchHandler}
      autoFocus={true}
    />
  );

  const actionBar = (
    <Wrapper.ActionBar right={actionBarRight} wideSpacing={true} />
  );
  return (
    <Wrapper
      header={
        <Wrapper.Header title={__("My Meetings")} submenu={menuMeeting()} />
      }
      actionBar={actionBar}
      content={
        <DataWithLoader
          data={<MyMeetingListContainer queryParams={queryParams} />}
          loading={loading}
          count={1}
          emptyText={__("Theres no meetings")}
          emptyImage="/images/actions/8.svg"
        />
      }
      leftSidebar={leftSideBar}
      transparent={true}
      hasBorder={true}
    />
  );
}

export default MyMeetings;
