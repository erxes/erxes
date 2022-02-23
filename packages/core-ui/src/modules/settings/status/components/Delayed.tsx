import React, { useEffect, useState } from 'react';

type Props = {
  children: React.ReactNode;
  wait?: number;
};

const Delayed = ({ children, wait = 500 }: Props) => {
  const [isShown, setIsShown] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setIsShown(true);
    }, wait);
  }, [wait]);

  return isShown ? <>{children}</> : null;
};

export default Delayed;
