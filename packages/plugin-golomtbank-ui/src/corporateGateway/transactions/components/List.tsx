import * as routerUtils from "@erxes/ui/src/utils/router";

import { BarItems, HeaderContent } from "@erxes/ui/src/layout/styles";
import React, { useState } from "react";

import { CustomRangeContainer } from "@erxes/ui-forms/src/forms/styles";
import DataWithLoader from "@erxes/ui/src/components/DataWithLoader";
import DateControl from "@erxes/ui/src/components/form/DateControl";
import EmptyContent from "@erxes/ui/src/components/empty/EmptyContent";
import FormControl from "@erxes/ui/src/components/form/Control";
import { IGolomtBankStatement } from "../../../types/ITransactions";
import Pagination from "@erxes/ui/src/components/pagination/Pagination";
import Row from "./Row";
import Table from "@erxes/ui/src/components/table";
import { __ } from "@erxes/ui/src/utils/core";
import dayjs from "dayjs";
import { useLocation, useNavigate } from "react-router-dom";

type Props = {
  statement: IGolomtBankStatement;
  queryParams: any;
  loading: boolean;
  showLatest?: boolean;
};

const List = (props: Props) => {
  const { queryParams, loading, statement } = props;
  const location = useLocation();
  const navigate = useNavigate();

  const [type, setType] = useState(queryParams.type || "all");

  const [transactions, setTransactions] = useState(
    (statement && statement.statements) || []
  );
  const totalCount = statement?.statements?.length || 0;
  const incomes = statement?.statements?.filter((t) => t.tranAmount > 0) || [];
  const outcomes = statement?.statements?.filter((t) => t.tranAmount < 0) || [];
  React.useEffect(() => {
    switch (type) {
      case "income":
        setTransactions(incomes);
        break;
      case "outcome":
        setTransactions(outcomes);
        break;
      default:
        setTransactions(statement.statements || []);
        break;
    }
  }, [type]);
  const headingText =
    totalCount > 0 ? `${statement.accountId}` : __("No transactions");

  const renderRow = () => {
    return transactions.map((transaction) => (
      <Row key={transaction.requestId} transaction={transaction} />
    ));
  };

  queryParams.loadingMainQuery = loading;

  const content = (
    <Table $whiteSpace="nowrap" $hover={true}>
      <thead>
        <tr>
          <th>{__("Date")}</th>
          <th>{__("Description")}</th>
          <th>{__("Begin balance")}</th>
          <th>{__("End balance")}</th>
          <th>{__("Amount")}</th>
        </tr>
      </thead>
      <tbody>{renderRow()}</tbody>
    </Table>
  );

  const rightActionBar = (
    <BarItems>
      <CustomRangeContainer>
        <FormControl
          id="type"
          name="type"
          componentclass="select"
          required={true}
          defaultValue={type}
          onChange={(e: any) => {
            setType(e.currentTarget.value);
            routerUtils.setParams(navigate, location, {
              type: e.currentTarget.value,
            });
          }}
        >
          {["all", "income", "outcome"].map((t) => (
            <option key={t} value={t}>
              {__(t)}
            </option>
          ))}
        </FormControl>

        <DateControl
          value={queryParams.startDate}
          required={false}
          name="startDate"
          onChange={(date: any) => {
            routerUtils.setParams(navigate, location, {
              startDate: dayjs(date).format("YYYY-MM-DD"),
            });
          }}
          placeholder={__("Start date")}
          dateFormat={"YYYY-MM-DD"}
        />

        <DateControl
          value={queryParams.endDate}
          required={false}
          name="endDate"
          placeholder={__("End date")}
          onChange={(date: any) => {
            routerUtils.setParams(navigate, location, {
              endDate: dayjs(date).format("YYYY-MM-DD"),
            });
          }}
          dateFormat={"YYYY-MM-DD"}
        />
      </CustomRangeContainer>
    </BarItems>
  );

  return (
    <>
      {!props.showLatest && (
        <HeaderContent>
          <h3>{headingText}</h3>

          {rightActionBar}
        </HeaderContent>
      )}

      <DataWithLoader
        data={content}
        loading={loading}
        count={totalCount}
        emptyContent={
          <EmptyContent
            content={{
              title: __("No data found"),
              description: __("No transactions found for this period"),
              steps: [],
            }}
            maxItemWidth="360px"
          />
        }
      />

      {!props.showLatest && <Pagination count={totalCount} />}
    </>
  );
};

export default List;
