import { Alert, __, router } from "coreui/utils";
import {
  FieldStyle,
  SidebarCounter,
  SidebarList,
} from "@erxes/ui/src/layout/styles";
import { PopoverButton, PopoverHeader } from "@erxes/ui/src/styles/eindex";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import Icon from "@erxes/ui/src/components/Icon";
import { Popover } from "@headlessui/react";
import Spinner from "@erxes/ui/src/components/Spinner";
import client from "@erxes/ui/src/apolloClient";
import { generateParams } from "@erxes/ui-inbox/src/inbox/utils";
import { gql } from "@apollo/client";
import { queries } from "@erxes/ui-inbox/src/inbox/graphql";

type Props = {
  queryParams: any;
  refetchRequired: string;
};

const StatusFilterPopover: React.FC<Props> = ({ queryParams }) => {
  const [counts, setCounts] = useState<any>({});
  const [loading, setLoading] = useState<boolean>(true);

  const location = useLocation();
  const navigate = useNavigate();

  const fetchData = (ignoreCache = false) => {
    setLoading(true);
    client
      .query({
        query: gql(queries.conversationCounts),
        variables: generateParams(queryParams),
        fetchPolicy: ignoreCache ? "network-only" : "cache-first",
        notifyOnNetworkStatusChange: true,
      })
      .then(({ data }: { data: any }) => {
        setCounts(data.conversationCounts);
        setLoading(false);
      })
      .catch((e) => {
        Alert.error(e.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData(true);
  }, [location.search]);

  useEffect(() => {
    if (queryParams.startDate || queryParams.endDate) {
      fetchData(true);
    }
  }, [queryParams.startDate, queryParams.endDate]);

  const clearStatusFilter = () => {
    router.setParams(navigate, location, {
      participating: "",
      status: "",
      unassigned: "",
      starred: "",
      awaitingResponse: "",
      callAnswered: "",
      callNotAnswered: "",
    });
  };

  const renderSingleFilter = (
    paramName: string,
    paramValue: string,
    text: string,
    count: number,
  ) => {
    const onClick = (e: React.MouseEvent) => {
      e.preventDefault();
      clearStatusFilter();
      router.setParams(navigate, location, { [paramName]: paramValue });
    };

    return (
      <li key={paramName}>
        <a
          href="#link"
          className={
            router.getParam(location, [paramName]) === paramValue
              ? "active"
              : ""
          }
          onClick={onClick}
        >
          <FieldStyle>{__(text)}</FieldStyle>
          <SidebarCounter>{count}</SidebarCounter>
        </a>
      </li>
    );
  };

  const renderPopover = () => {
    if (loading) {
      return (
        <div id="filter-popover">
          <PopoverHeader>{__("Filter by status")}</PopoverHeader>
          <Spinner objective={true} />
        </div>
      );
    }

    return (
      <div id="filter-popover" className="popover-body">
        <PopoverHeader>{__("Filter by status")}</PopoverHeader>
        <SidebarList>
          {renderSingleFilter(
            "unassigned",
            "true",
            "Unassigned",
            counts.unassigned,
          )}
          {renderSingleFilter(
            "participating",
            "true",
            "Participating",
            counts.participating,
          )}
          {renderSingleFilter(
            "awaitingResponse",
            "true",
            "Awaiting Response",
            counts.awaitingResponse,
          )}
          {renderSingleFilter("status", "closed", "Resolved", counts.resolved)}
          {renderSingleFilter(
            "callAnswered",
            "true",
            "Call Answered",
            counts.callAnswered,
          )}
          {renderSingleFilter(
            "callNotAnswered",
            "true",
            "Call Not Answered",
            counts.callNotAnswered,
          )}
        </SidebarList>
      </div>
    );
  };

  return (
    <Popover>
      {({ open }) => (
        <>
          <Popover.Button>
            <PopoverButton>
              {__("Status")}
              <Icon icon={open ? "angle-up" : "angle-down"} />
            </PopoverButton>
          </Popover.Button>
          <Popover.Panel>{renderPopover()}</Popover.Panel>
        </>
      )}
    </Popover>
  );
};

export default StatusFilterPopover;
