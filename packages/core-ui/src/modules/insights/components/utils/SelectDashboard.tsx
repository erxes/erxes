import React from "react";

import DropdownToggle from "@erxes/ui/src/components/DropdownToggle";
import Dropdown from "@erxes/ui/src/components/Dropdown";

import Button from "@erxes/ui/src/components/Button";
import { __ } from "@erxes/ui/src/utils/index";

import { ISection } from "../../types";

type Props = { sections: ISection[]; handleMutation(id: String): void };

const SelectDashboard = (props: Props) => {
  const { sections, handleMutation } = props;

  return (
    <Dropdown
      drop="down"
      as={DropdownToggle}
      toggleComponent={
        <Button btnStyle="success" size="small">
          Add to dashboard
        </Button>
      }
      // alignRight={true}
    >
      {sections.map((section) => (
        <li key={section._id}>
          <a
            href="#delete"
            onClick={() => {
              handleMutation(section._id);
            }}
          >
            {__(`# ${section.name}`)}
          </a>
        </li>
      ))}
    </Dropdown>
  );
};

export default SelectDashboard;
