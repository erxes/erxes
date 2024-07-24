import * as React from 'react';
import * as classNames from 'classnames';

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
    { 'w-full': full },
    buttonProps.className
  );

  return (
    <button className={buttonClassNames} type={type} {...buttonProps}>
      {children}
      {icon}
    </button>
  );
};

export default Button;
