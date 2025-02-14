import { FlexItem, LeftItem } from "@erxes/ui/src/components/step/styles";
import {
  ICallData,
  IDepartment,
} from "@erxes/ui-inbox/src/settings/integrations/types";
import {
  OperatorFormView,
  OperatorRemoveBtn,
} from "@erxes/ui-inbox/src/settings/integrations/styles";
import React, { useState } from "react";

import Button from "@erxes/ui/src/components/Button";
import ControlLabel from "@erxes/ui/src/components/form/Label";
import FormControl from "@erxes/ui/src/components/form/Control";
import FormGroup from "@erxes/ui/src/components/form/Group";
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
  const [isCallReceive, setIsCallReceive] = useState(
    Boolean(callData?.isReceiveWebCall) || false
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isDepartmentNameUnique = (
    name: string,
    excludeName?: string
  ): boolean => {
    const lowerCaseName = name.toLowerCase();
    return !departments.some(
      (dept) =>
        dept.name.toLowerCase() === lowerCaseName && dept.name !== excludeName
    );
  };

  const updateDepartmentName = (name: string, value: string) => {
    if (!isDepartmentNameUnique(value, name)) {
      setErrors((prev) => ({
        ...prev,
        [name]: __("Department name must be unique"),
      }));
      return;
    }
    setErrors((prev) => ({ ...prev, [name]: "" }));
    const updatedDepartments = departments.map((dept) =>
      dept.name === name ? { ...dept, name: value } : dept
    );

    setTimeout(() => {
      setDepartments(updatedDepartments);
      onChange("callData", {
        departments: updatedDepartments,
        isReceiveWebCall: isCallReceive,
      });
    }, 500);
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

  return (
    <FlexItem>
      <LeftItem>
        {departments.map(({ name, operators }) => (
          <div key={name}>
            <ControlLabel required>{__("Name")}</ControlLabel>
            <p>{__("Department name")}</p>
            <FormControl
              required
              onChange={(e) =>
                updateDepartmentName(
                  name,
                  (e.currentTarget as HTMLInputElement).value
                )
              }
              defaultValue={name}
            />
            {errors[name] && <p style={{ color: "red" }}>{errors[name]}</p>}
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
            <FormGroup>
              <Button
                btnStyle="danger"
                icon="times"
                size="medium"
                onClick={() => removeDepartment(name)}
              >
                {__("Remove Department")}
              </Button>
            </FormGroup>
          </div>
        ))}
        <FormGroup>
          <Button
            btnStyle="simple"
            icon="plus-1"
            size="medium"
            onClick={addDepartment}
          >
            {__("Add Department")}
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
