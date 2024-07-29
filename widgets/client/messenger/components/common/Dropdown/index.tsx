import * as React from 'react';
import useOutsideClick from '../../../hooks/useClickOutside';

type Props = {
  trigger: React.ReactElement;
  menu: React.ReactElement[];
};
const Dropdown: React.FC<Props> = ({ trigger, menu }) => {
  const [open, setOpen] = React.useState(false);

  const handleOpen = () => {
    setOpen(!open);
  };

  const closeDropdown = () => {
    setOpen(false);
  };

  const ref = useOutsideClick(closeDropdown);

  return (
    <div className="dropdown" ref={ref as React.RefObject<HTMLDivElement>}>
      {React.cloneElement(trigger, {
        onClick: handleOpen,
      })}
      {open ? (
        <ul className="menu">
          {menu.map((menuItem, index) => (
            <li key={index} className="menu-item">
              {React.cloneElement(menuItem, {
                onClick: () => {
                  menuItem.props.onClick();
                  setOpen(false);
                },
              })}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
};
export default Dropdown;
