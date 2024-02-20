import React from 'react';

import DropdownToggle from '@erxes/ui/src/components/DropdownToggle';
import Dropdown from 'react-bootstrap/Dropdown';

import Button from '@erxes/ui/src/components/Button';
import { __ } from '@erxes/ui/src/utils/index';

import { ISection } from '../../types';

type Props = { sections: ISection[]; handleMutation(id: String): void };

const SelectDashboard = (props: Props) => {
  const { sections, handleMutation } = props;

  return (
    <Dropdown drop="down" alignRight={true}>
      <Dropdown.Toggle as={DropdownToggle} id="dropdown-info">
        <Button btnStyle="simple">Add to dashboard</Button>
      </Dropdown.Toggle>
      <Dropdown.Menu className="dropdown-container">
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
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default SelectDashboard;
