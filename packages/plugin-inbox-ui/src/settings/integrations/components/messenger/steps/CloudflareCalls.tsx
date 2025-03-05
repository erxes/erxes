import {
  CallRouting,
  CallRoutingRemove,
  OperatorFormView,
  OperatorRemoveBtn,
} from "@erxes/ui-inbox/src/settings/integrations/styles";
import { FlexItem, LeftItem } from "@erxes/ui/src/components/step/styles";
import {
  ICallData,
  IDepartment,
} from "@erxes/ui-inbox/src/settings/integrations/types";
import React, { useState } from "react";

import Button from "@erxes/ui/src/components/Button";
import ControlLabel from "@erxes/ui/src/components/form/Label";
import FormControl from "@erxes/ui/src/components/form/Control";
import FormGroup from "@erxes/ui/src/components/form/Group";
import Icon from "@erxes/ui/src/components/Icon";
import SelectTeamMembers from "@erxes/ui/src/team/containers/SelectTeamMembers";
import Toggle from "@erxes/ui/src/components/Toggle";
import { __ } from "coreui/utils";

type Props = {
  onChange: (name: any, value: any) => void;
  callData?: ICallData;
};

const CloudflareCalls: React.FC<Props> = ({ onChange, callData }) => {
  const [departments, setDepartments] = useState<IDepartment[]>(
    callData?.departments || []
  );
  const [routingName, setRoutingName] = useState("");
  const [isCallReceive, setIsCallReceive] = useState(
    Boolean(callData?.isReceiveWebCall) || false
  );

  const updateDepartmentName = (name: string) => {
    const updatedDepartments = departments.map((dept) =>
      dept.name === name ? { ...dept, name: routingName } : dept
    );
    setDepartments(updatedDepartments);

    onChange("callData", {
      departments: updatedDepartments,
      isReceiveWebCall: isCallReceive,
    });
  };

  const addDepartment = () => {
    const newDepartment = { name: "", operators: [] };
    setDepartments((prev) => [...prev, newDepartment]);
  };

  const addOperator = (departmentName: string) => {
    setDepartments((prev) =>
      prev.map((dept) =>
        dept.name === departmentName
          ? {
              ...dept,
              operators: [...dept.operators, { userId: "", name: "" }],
            }
          : dept
      )
    );
  };

  const removeOperator = (departmentName: string, index: number) => {
    const updatedDepartments = departments.map((dept) =>
      dept.name === departmentName
        ? {
            ...dept,
            operators: dept?.operators?.filter((_, i) => i !== index),
          }
        : dept
    );
    setDepartments(updatedDepartments);
    onChange("callData", {
      departments: updatedDepartments,
      isReceiveWebCall: isCallReceive,
    });
  };

  // Add this function to remove a department
  const removeDepartment = (departmentName: string) => {
    const updatedDepartments = departments.filter(
      (dept) => dept.name !== departmentName
    );
    setDepartments(updatedDepartments);
    onChange("callData", {
      departments: updatedDepartments,
      isReceiveWebCall: isCallReceive,
    });
  };

  const handleToggleWebCall = (e) => {
    const isChecked = e.target.checked;
    setIsCallReceive(isChecked);
    onChange("callData", {
      departments: departments,
      isReceiveWebCall: isChecked,
    });
  };

  const handleOperatorChange = (
    departmentName: string,
    index: number,
    userId: string
  ) => {
    const updatedDepartments = departments.map((dept) =>
      dept.name === departmentName
        ? {
            ...dept,
            operators: dept.operators?.map((op, i) =>
              i === index ? { ...op, userId } : op
            ),
          }
        : dept
    );

    setDepartments(updatedDepartments);
    onChange("callData", {
      departments: updatedDepartments,
      isReceiveWebCall: isCallReceive,
    });
  };

  const renderCallRouting = () => {
    return departments.map(({ name, operators }) => (
      <CallRouting key={name}>
        <ControlLabel required>{__("Call routing name")}</ControlLabel>
        <FormControl
          className="routing-name"
          required
          onChange={(e) =>
            setRoutingName((e.currentTarget as HTMLInputElement).value)
          }
          onBlur={(e) => updateDepartmentName(name)}
          defaultValue={name}
        />
        {operators?.map((operator, index) => (
          <OperatorFormView key={index}>
            <OperatorRemoveBtn>
              <Button
                onClick={() => removeOperator(name, index)}
                btnStyle="danger"
                icon="times"
              />
            </OperatorRemoveBtn>
            <FormGroup>
              <SelectTeamMembers
                label={`Choose operator ${index + 1}`}
                name="selectedMembers"
                multi={false}
                initialValue={operator.userId}
                onSelect={(value) =>
                  handleOperatorChange(name, index, value as string)
                }
              />
            </FormGroup>
          </OperatorFormView>
        ))}
        <FormGroup>
          <Button
            btnStyle="simple"
            icon="plus-1"
            size="medium"
            onClick={() => addOperator(name)}
          >
            {__("Add Operator")}
          </Button>
        </FormGroup>
        {/* Add a button to remove the department */}
        <CallRoutingRemove onClick={() => removeDepartment(name)}>
          <Icon icon="times" size={16} />
        </CallRoutingRemove>
      </CallRouting>
    ));
  };

  return (
    <FlexItem>
      <LeftItem>
        <FormGroup>
          <ControlLabel>{__("Call Routing")}</ControlLabel>
          <p>
            {__(
              "The visitor chooses a department, group, or team. The system directs the call to that group."
            )}
          </p>
          {renderCallRouting()}
          <Button
            btnStyle="link"
            icon="plus-1"
            size="medium"
            onClick={addDepartment}
          >
            {__("Add Call Routing")}
          </Button>
        </FormGroup>
        <FormGroup>
          <ControlLabel>{__("Turn on Cloudflare Calls")}</ControlLabel>
          <p>{__("If turned on, possible to receive web calls")}</p>
          <Toggle
            checked={isCallReceive || false}
            onChange={handleToggleWebCall}
            icons={{
              checked: <span>{__("Yes")}</span>,
              unchecked: <span>{__("No")}</span>,
            }}
          />
        </FormGroup>
      </LeftItem>
    </FlexItem>
  );
};

export default CloudflareCalls;
