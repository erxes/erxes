import { LeftContent, Row } from "../../styles";

import ControlLabel from "@erxes/ui/src/components/form/Label";
import FormGroup from "@erxes/ui/src/components/form/Group";
import { IDepartment } from "../types";
import { IOption } from "@erxes/ui/src/types";
import React from "react";
import Select from "react-select";
import { __ } from "@erxes/ui/src/utils/core";

type Props = {
  departments: IDepartment[];
  onChange?: (values: string[]) => any;
  defaultValue?: string[];
  isRequired?: boolean;
  description?: string;
};

class SelectDepartments extends React.Component<Props, {}> {
  generateUserOptions(array: IDepartment[] = []): IOption[] {
    return array.map((item) => {
      const department = item || ({} as IDepartment);

      return {
        value: department._id,
        label: department.title,
      };
    });
  }

  onChangeChannel = (values) => {
    if (this.props.onChange) {
      this.props.onChange(values.map((item) => item.value) || []);
    }
  };

  render() {
    const { departments, defaultValue, isRequired } = this.props;

    return (
      <FormGroup>
        <ControlLabel required={isRequired}>Departments</ControlLabel>
        <Row>
          <LeftContent>
            <Select
              placeholder={__("Select departments")}
              value={this.generateUserOptions(departments).filter((o) =>
                defaultValue?.includes(o.value)
              )}
              onChange={this.onChangeChannel}
              options={this.generateUserOptions(departments)}
              isMulti={true}
            />
          </LeftContent>
        </Row>
      </FormGroup>
    );
  }
}

export default SelectDepartments;
