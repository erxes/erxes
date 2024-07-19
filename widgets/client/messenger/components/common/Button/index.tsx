import * as React from 'react';
import * as classNames from 'classnames';
import './index.scss';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  icon?: React.JSX.Element;
  full?: boolean;
  withDefaultStyle?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

const Button: React.FC<ButtonProps> = ({
  children,
  icon,
  full,
  withDefaultStyle,
  type = 'button',
  ...buttonProps
}) => {
  const buttonClassNames = classNames(
    'base-button',
    {
      'main-button': withDefaultStyle || children,
    },
    { 'w-full': full }
  );

  return (
    <button
      className={`${buttonClassNames} ${buttonProps.className}`}
      type={type}
      {...buttonProps}
    >
      {children}
      {icon}
    </button>
  );
};

export default Button;
