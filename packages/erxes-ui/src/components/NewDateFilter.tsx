import { PopoverButton, PopoverHeader } from "../styles/main";
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import Alert from "../utils/Alert";
import Button from "./Button";
import Icon from "./Icon";
import { Popover } from "@headlessui/react";
import { __ } from "../utils/core";
import asyncComponent from "./AsyncComponent";
import client from "@erxes/ui/src/apolloClient";
import dayjs from "dayjs";
import { dimensions } from "../styles";
import { gql } from "@apollo/client";
import { setParams } from "../utils/router";
import styled from "styled-components";
import { withApollo } from "@apollo/client/react/hoc";

const Datetime = asyncComponent(
  () =>
    import(/* webpackChunkName: "Datetime" */ "@nateradebaugh/react-datetime"),
);

const FlexRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
  padding: 0 ${dimensions.unitSpacing}px ${dimensions.unitSpacing}px;
`;

const FlexBetween = styled(FlexRow)`
  justify-content: space-between;
`;

const DateName = styled.div`
  text-transform: uppercase;
  margin: ${dimensions.unitSpacing}px 0;
  text-align: center;
  font-size: 12px;
  color: #888;
`;

type Props = {
  queryParams?: any;
  countQuery?: string;
  countQueryParam?: string;
};

const NewDateFilter: React.FC<Props> = ({
  queryParams = {},
  countQuery,
  countQueryParam,
}) => {
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [totalCount, setTotalCount] = useState<number>(0);

  const location = useLocation();
  const navigate = useNavigate();

  const applyFilter = (start: dayjs.Dayjs, end: dayjs.Dayjs) => {
    if (start.isAfter(end)) {
      return Alert.error("The start date must be earlier than the end date.");
    }

    const startForApi = start.clone().add(8, "hour").toISOString();
    const endForApi = end.clone().add(8, "hour").toISOString();

    setStartDate(start.toDate());
    setEndDate(end.toDate());

    setParams(navigate, location, {
      startDate: startForApi,
      endDate: endForApi,
    });

    if (countQuery) {
      client
        .query({
          query: gql(countQuery),
          variables: {
            ...queryParams,
            startDate: startForApi,
            endDate: endForApi,
          },
        })
        .then(({ data }) => {
          if (countQueryParam) {
            setTotalCount(data[countQueryParam]);
          }
        })
        .catch((e) => Alert.error(e.message));
    }
  };

  const applyQuickRange = (
    type:
      | "today"
      | "yesterday"
      | "last7"
      | "last30"
      | "month"
      | "lastMonth"
      | "year",
  ) => {
    let start: dayjs.Dayjs;
    let end: dayjs.Dayjs;

    switch (type) {
      case "today":
        start = dayjs().startOf("day");
        end = dayjs().endOf("day");
        break;

      case "yesterday":
        start = dayjs().subtract(1, "day").startOf("day");
        end = dayjs().subtract(1, "day").endOf("day");
        break;

      case "last7":
        start = dayjs().subtract(6, "day").startOf("day");
        end = dayjs().endOf("day");
        break;

      case "last30":
        start = dayjs().subtract(29, "day").startOf("day");
        end = dayjs().endOf("day");
        break;

      case "month":
        start = dayjs().startOf("month");
        end = dayjs().endOf("month");
        break;

      case "lastMonth":
        start = dayjs().subtract(1, "month").startOf("month");
        end = dayjs().subtract(1, "month").endOf("month");
        break;

      case "year":
        start = dayjs().startOf("year");
        end = dayjs().endOf("year");
        break;

      default:
        return;
    }

    applyFilter(start, end);
  };

  const onDateChange = (type: "start" | "end") => (date: any) => {
    if (typeof date === "string") return;

    if (type === "start") {
      setStartDate(date);
    } else {
      setEndDate(date);
    }
  };

  const dateProps = {
    dateFormat: "YYYY/MM/DD",
    timeFormat: "HH:mm",
    closeOnSelect: false,
  };

  return (
    <Popover>
      {({ open }) => (
        <>
          <Popover.Button>
            <PopoverButton>
              {__("Date")}
              <Icon icon={open ? "angle-up" : "angle-down"} />
            </PopoverButton>
          </Popover.Button>

          <Popover.Panel className="date-popover">
            <PopoverHeader>{__("Filter by date")}</PopoverHeader>

            <FlexRow style={{ flexWrap: "wrap" }}>
              <Button size="small" onClick={() => applyQuickRange("today")}>
                Today
              </Button>

              <Button size="small" onClick={() => applyQuickRange("yesterday")}>
                Yesterday
              </Button>

              <Button size="small" onClick={() => applyQuickRange("last7")}>
                Last 7 days
              </Button>

              <Button size="small" onClick={() => applyQuickRange("last30")}>
                Last 30 days
              </Button>

              <Button size="small" onClick={() => applyQuickRange("month")}>
                This month
              </Button>

              <Button size="small" onClick={() => applyQuickRange("lastMonth")}>
                Last month
              </Button>

              <Button size="small" onClick={() => applyQuickRange("year")}>
                This year
              </Button>
            </FlexRow>

            <FlexBetween>
              <div>
                <DateName>Start date</DateName>
                <Datetime
                  {...dateProps}
                  input={false}
                  value={startDate}
                  onChange={onDateChange("start")}
                />
              </div>

              <div>
                <DateName>End date</DateName>
                <Datetime
                  {...dateProps}
                  input={false}
                  value={endDate}
                  onChange={onDateChange("end")}
                />
              </div>
            </FlexBetween>

            <FlexBetween>
              {countQuery && (
                <span>
                  {__("Total")}: <b>{totalCount}</b>
                </span>
              )}

              <Button
                btnStyle="warning"
                size="small"
                icon="filter-1"
                onClick={() => applyFilter(dayjs(startDate), dayjs(endDate))}
              >
                Filter
              </Button>
            </FlexBetween>
          </Popover.Panel>
        </>
      )}
    </Popover>
  );
};

export default withApollo<Props>(NewDateFilter);
