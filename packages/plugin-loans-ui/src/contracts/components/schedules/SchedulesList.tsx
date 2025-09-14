import { ISchedule, IScheduleYear } from "../../types";

import Button from "@erxes/ui/src/components/Button";
import Spinner from "@erxes/ui/src/components/Spinner";
import Table from "@erxes/ui/src/components/table";
import { __ } from "coreui/utils";
import React, { useState } from "react";
import { ScheduleYears } from "../../styles";
import ScheduleRow from "./ScheduleRow";

interface IProps {
  contractId: string;
  schedules: ISchedule[];
  loading: boolean;
  scheduleYears: IScheduleYear[];
  currentYear: number;
  leaseType?: string;
}

const SchedulesList = (props: IProps) => {
  const { schedules, loading, leaseType, scheduleYears, currentYear } = props;

  const [toggleCurrentYear, setToggleCurrentYear] = useState<number | null>(
    null
  );

  const renderYear = () => {
    return scheduleYears.map((item) => {
      return (
        <Button
          key={item.year}
          btnStyle={toggleCurrentYear === item.year ? "success" : "primary"}
          onClick={() =>
            setToggleCurrentYear(
              toggleCurrentYear === item.year ? null : item.year
            )
          }
        >
          {item.year}
        </Button>
      );
    });
  };

  if (loading) {
    return <Spinner />;
  }

  return (
    <>
      <ScheduleYears>{renderYear()}</ScheduleYears>
      <Table $striped>
        <thead>
          <tr>
            <th />
            <th>{__("Date")}</th>
            <th>{__("Loan Balance")}</th>
            <th>{__("Loan Payment")}</th>
            <th>{__("Interest")}</th>
            {leaseType === "linear" && <th>{__("Commitment interest")}</th>}
            <th>{__("Loss")}</th>
            <th>{__("Total")}</th>
          </tr>
        </thead>
        <tbody id="schedules">
          {schedules.map((schedule) => (
            <ScheduleRow
              schedule={schedule}
              key={schedule._id}
              leaseType={leaseType}
              currentYear={toggleCurrentYear}
            />
          ))}
        </tbody>
      </Table>
    </>
  );
};

export default SchedulesList;
