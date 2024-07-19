import * as React from 'react';
import { m } from 'framer-motion';
import { IconProps } from './Icons';
import useHover from '../../hooks/useHover';

type Props = {
  label?: string;
  icon: (props: IconProps) => React.ReactNode;
  isActive: boolean;
  handleClick: (route: string) => (event: React.MouseEvent) => void;
  route: string;
};

const Item: React.FC<Props> = ({
  label,
  icon,
  isActive,
  handleClick,
  route,
}) => {
  const renderIcon = () => {
    return icon({ filled: isActive });
  };

  const renderLabel = () => {
    /* Render the label if the item is active and a label is provided */
    if (!label || !isActive) {
      return null;
    }
    return <span>{label}</span>;
  };

  return (
    <m.li
      className={`nav-item ${isActive ? 'active' : ''} `}
      onClick={handleClick(route)}
    >
      <m.div className="nav-content">
        {renderIcon()}
        {renderLabel()}
      </m.div>
    </m.li>
  );
};

export default Item;
