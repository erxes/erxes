import * as React from "react";

import { getCallData, getColor, hexToRGBA } from "../../utils/util";

import Button from "../common/Button";
import { CloudflareCallDataDepartment } from "../../../types";
import Container from "../common/Container";
import { __ } from "../../../utils";

type Props = {
  call: () => void;
  onBack: (isCalling: boolean) => void;
  setDepartmentId: (departmentId: string) => void;
  departments: CloudflareCallDataDepartment[];
  departmentId: string;
};

const RouteChooser = ({
  call,
  onBack,
  departments,
  departmentId,
  setDepartmentId,
}: Props) => {
  const color = getColor();
  const callData = getCallData();
  const { secondPageHeader, secondPageDescription } = callData;

  const renderDepartments = () => {
    if (!departments || departments.length === 0) {
      return <div className="">No available team at the moment!</div>;
    }

    return (
      <div className="list">
        {departments?.map((item: any) => {
          const isActive = departmentId === item._id;

          const style = {
            background: `${hexToRGBA(color, "0.2")}`,
            color,
          };

          const activeStyle = {
            background: `${hexToRGBA(color, "0.3")}`,
            borderColor: `${hexToRGBA(color, "0.6")}`,
            color,
          };

          return (
            <span
              key={item._id}
              className={`list-item`}
              onClick={() => setDepartmentId(item._id)}
              style={isActive ? activeStyle : style}
            >
              {item.name}
            </span>
          );
        })}
      </div>
    );
  };

  return (
    <Container
      title={__("Call")}
      withBottomNavBar={false}
      onBackButton={() => onBack(false)}
    >
      <div className="call-container">
        <div className="h-full flex flex-col justify-between">
          <div className="flex flex-col gap-4">
            <div className="detail-info">
              <h2>
                {__(secondPageHeader || "Who would you like to contact?")}
              </h2>
              <p>
                {__(
                  secondPageDescription ||
                    "Select the department, group, or team you’d like to reach out to, so we can connect you to the right contact seamlessly"
                )}
              </p>
            </div>

            {renderDepartments()}
          </div>
          <Button full onClick={() => call()}>
            <span className="font-semibold">{__("Call")}</span>
          </Button>
        </div>
      </div>
    </Container>
  );
};

export default RouteChooser;
