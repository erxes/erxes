import React from 'react';

type Props = {
  link: string;
};

const Recording = (props: Props) => {
  const { link } = props;

  return (
    <video width="100%" height="100%" controls={true} autoPlay={true}>
      <source src={link} type="video/webm" />
    </video>
  );
};

export default Recording;
