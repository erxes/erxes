import classNames from "classnames";
import * as React from "react";

type Props = {
  onClick: (isFormVisible: boolean) => void;
  isFormVisible: boolean;
  color: string;
};

function Launcher({ isFormVisible, onClick, color }: Props) {
  const clickHandler = () => {
    onClick(isFormVisible);
  };

  const launcherClasses = classNames("erxes-launcher", {
    "close-launcher": isFormVisible
  });

  return (
    <div
      style={{ backgroundColor: color }}
      className={launcherClasses}
      onClick={clickHandler}
    />
  );
}

export default Launcher;
