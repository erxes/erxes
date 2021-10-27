import * as React from 'react';

type Props = {
  title: string;
  key: any;
  type: string;
  widgetColor: string;
  status?: string;
  description?: string;
  goTo?: () => void;
};

function Card({ widgetColor, title, type, key, status }: Props) {
  const [style, setStyle] = React.useState({
    borderColor: widgetColor,
  });

  const onClick = () => {
    const addedStyle = { backgroundColor: widgetColor };
    //setStyle({ ...style, addedStyle);
  };
  return (
    <div onMouseEnter={onClick} className="card">
      <h4> {title} </h4>
    </div>
  );
}

export default Card;
