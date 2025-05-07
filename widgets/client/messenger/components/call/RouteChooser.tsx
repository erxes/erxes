import * as React from "react";

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
              <h2>{__("Who would you like to contact?")}</h2>
              <p>
                {__(
                  "Select the department, group, or team you’d like to reach out to, so we can connect you to the right contact seamlessly"
                )}
              </p>
            </div>

            <div className="list">
              {departments?.map((item: any) => (
                <span
                  key={item._id}
                  className={`list-item ${
                    departmentId === item._id ? "active" : ""
                  }`}
                  onClick={() => setDepartmentId(item._id)}
                >
                  {item.name}
                </span>
              ))}
            </div>
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
