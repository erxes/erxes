import * as React from 'react';

type Props = {
  children: React.ReactNode;
  p?: string | number;
  px?: string | number;
  py?: string | number;
};
const Card: React.FC<Props> = ({ children, p, px, py }) => {
  return (
    <div
      className="card"
      style={{
        paddingTop: py,
        paddingBottom: py,
        paddingRight: px,
        paddingLeft: px,
        padding: p,
      }}
    >
      {children}
    </div>
  );
};

export default Card;
