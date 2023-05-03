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
      {props.icons.map(image => (
        <Dropdown.Item key={image} onClick={() => handleClick(image)}>
          <img src={image} alt={image} />
        </Dropdown.Item>
      ))}
    </DropdownButton>
  );
};

export default IconSelector;
