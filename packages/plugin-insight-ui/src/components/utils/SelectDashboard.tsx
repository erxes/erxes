import React from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownToggle from '@erxes/ui/src/components/DropdownToggle';
import { Button, Icon, __ } from '@erxes/ui/src';
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
          <li>
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
