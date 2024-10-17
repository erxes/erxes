import React, { useRef, useState } from "react";

import Alert from "@erxes/ui/src/utils/Alert";
import { BarItems } from "@erxes/ui/src/layout/styles";
import Button from "@erxes/ui/src/components/Button";
import { ClassificationHistoryTableWrapper } from "../styles";
import DataWithLoader from "@erxes/ui/src/components/DataWithLoader";
import FormControl from "@erxes/ui/src/components/form/Control";
import { IPeriodLock } from "../types";
import { IUser } from "@erxes/ui/src/auth/types";
import Pagination from "@erxes/ui/src/components/pagination/Pagination";
import PeriodLockRow from "./ClassificationHistoryRow";
import SortHandler from "@erxes/ui/src/components/SortHandler";
import Table from "@erxes/ui/src/components/table";
import Wrapper from "@erxes/ui/src/layout/components/Wrapper";
import { __ } from "coreui/utils";
import { can } from "@erxes/ui/src/utils/core";
import confirm from "@erxes/ui/src/utils/confirmation/confirm";
import { menuContracts } from "../../constants";
import withConsumer from "../../withConsumer";
import { useNavigate } from "react-router-dom";

interface IProps {
  classificationHistory: IPeriodLock[];
  loading: boolean;
  searchValue: string;
  totalCount: number;
  // TODO: check is below line not throwing error ?
  toggleBulk: () => void;
  toggleAll: (targets: IPeriodLock[], containerId: string) => void;
  bulk: any[];
  isAllSelected: boolean;
  emptyBulk: () => void;
  removeClassificationHistory: (
    doc: { classificationIds: string[] },
    emptyBulk: () => void
  ) => void;
  queryParams: any;
  currentUser: IUser;
}

const ClassificationHistoryList = (props: IProps) => {
  const timerRef = useRef<number | null>(null);
  const [searchValue, setSearchValue] = useState(props.searchValue);
  const {
    toggleAll,
    classificationHistory,
    emptyBulk,
    loading,
    toggleBulk,
    bulk,
    isAllSelected,
    totalCount,
    queryParams,
    currentUser,
  } = props;
  const navigate = useNavigate()

  const onChange = () => {
    toggleAll(classificationHistory, "classificationHistory");
  };

  const search = (e) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    const value = e.target.value;

    setSearchValue(value);

    timerRef.current = setTimeout(() => {
      navigate(`/settings/contract-types?searchValue=${value}`);
    }, 500);
  };

  const removeClassificationHistory = (classificationHistory) => {
    const classificationIds: string[] = [];

    classificationHistory.forEach((periodLock) => {
      classificationIds.push(periodLock._id);
    });

    props.removeClassificationHistory({ classificationIds }, emptyBulk);
  };

  const moveCursorAtTheEnd = (e) => {
    const tmpValue = e.target.value;
    e.target.value = "";
    e.target.value = tmpValue;
  };

  const mainContent = (
    <ClassificationHistoryTableWrapper>
      <Table
        $whiteSpace="nowrap"
        $bordered={true}
        $hover={true}
        $striped={true}
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
            <th>
              <SortHandler sortField={"date"} label={__("Date")} />
            </th>
            <th>
              <SortHandler sortField={"total"} label={__("Total")} />
            </th>
            <th>
              <SortHandler sortField={"total"} label={__("Classification")} />
            </th>
            <th>
              <SortHandler
                sortField={"total"}
                label={__("New Classification")}
              />
            </th>
            <th></th>
          </tr>
        </thead>
        <tbody id="classificationHistory">
          {classificationHistory.map((periodLock) => (
            <PeriodLockRow
              periodLock={periodLock}
              isChecked={bulk.includes(periodLock)}
              key={periodLock._id}
              toggleBulk={toggleBulk}
            />
          ))}
        </tbody>
      </Table>
    </ClassificationHistoryTableWrapper>
  );

  let actionBarLeft: React.ReactNode;

  if (bulk.length > 0) {
    const onClick = () =>
      confirm()
        .then(() => {
          removeClassificationHistory(bulk);
        })
        .catch((error) => {
          Alert.error(error.message);
        });

    actionBarLeft = (
      <BarItems>
        {can("manageClassificationHistory", currentUser) && (
          <Button btnStyle="danger" icon="cancel-1" onClick={onClick}>
            {__("Delete")}
          </Button>
        )}
      </BarItems>
    );
  }

  const actionBarRight = (
    <BarItems>
      <FormControl
        type="text"
        placeholder={__("Type to search")}
        onChange={search}
        value={searchValue}
        autoFocus={true}
        onFocus={moveCursorAtTheEnd}
      />
    </BarItems>
  );

  const actionBar = (
    <Wrapper.ActionBar right={actionBarRight} left={actionBarLeft} />
  );

  return (
    <Wrapper
      hasBorder
      header={
        <Wrapper.Header
          title={__(`Period Locks`) + ` (${totalCount})`}
          queryParams={queryParams}
          submenu={menuContracts.filter((row) =>
            can(row.permission, currentUser)
          )}
        />
      }
      actionBar={actionBar}
      footer={<Pagination count={totalCount} />}
      content={
        <DataWithLoader
          data={mainContent}
          loading={loading}
          count={classificationHistory.length}
          emptyText={__("Add in your first periodLock!")}
          emptyImage="/images/actions/1.svg"
        />
      }
    />
  );
};

export default withConsumer(ClassificationHistoryList);
