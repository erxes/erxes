import React, { useState, useEffect } from 'react';
import { Dropdown, DropdownButton } from 'react-bootstrap';

type Props = {
  icons: string[];
  onImageSelected: (image: string) => void;
};

const IconSelector = (props: Props) => {
  const handleClick = icon => {
    props.onImageSelected(icon);
  };

  //   return (
  //     <div>
  //       {props.icons.map((icon) => (
  //         <img
  //           key={icon}
  //           src={icon}
  //           alt={icon}
  //           onClick={() => handleClick(icon)}
  //         />
  //       ))}
  //     </div>
  //   );

  return (
    <DropdownButton id="dropdown-basic-button" title="Select Icon">
      <Dropdown.Item as="div" className="row" style={{ columnCount: 3 }}>
        {props.icons.map(icon => (
          <Dropdown.Item key={icon} as="div" className="col">
            <img src={icon} alt={icon} onClick={() => handleClick(icon)} />
          </Dropdown.Item>
        ))}
      </Dropdown.Item>
    </DropdownButton>
  );
};

export default IconSelector;
