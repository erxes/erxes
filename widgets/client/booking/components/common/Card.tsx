import * as React from 'react';

type Props = {
  type: string;
  key: string;
  description?: string;
  widgetColor?: string;
  status?: string;
};

function Card({ widgetColor, type, key, description, status }: Props) {
  return (
    <div className={`item ${type === 'category' ? ' category ' : ''}`}>
      <h4> {`${type} ${key}`} </h4>
      {description && <p> {description} </p>}
      {status && <div className="status category "> {status} </div>}
    </div>
  );
}

export default Card;
