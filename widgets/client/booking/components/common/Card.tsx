import * as React from 'react';

type Props = {
  type: string;
  key: string;
  widgetColor?: string;
  status?: string;
};

function Card({ widgetColor, type, key, status }: Props) {
  return (
    <div className={`item ${type === "block" ? " block " : ""}`}>
      <h4> {`${type} ${key}`} </h4>
    </div>
  );
}

export default Card;
