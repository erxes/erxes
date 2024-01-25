import React, { useEffect, useState } from 'react';
import ImageUploader from './ImageUpload';
import { FormControl } from '@erxes/ui/src';
import ButtonsGenerator from './ButtonGenerator';
import { Column } from '@erxes/ui/src/styles/main';

function Card({ onChange, ...props }) {
  const [card, setCard] = useState(props.card || {});

  const {
    _id,
    buttons = [],
    image = '',
    title = '',
    subtitle = '',
  } = card || {};

  useEffect(() => {
    setCard(props.card);
  }, [props.card]);

  const handleChange = (e) => {
    const { name, value } = e.currentTarget as HTMLInputElement;

    onChange(_id, name, value);
  };

  return (
    <Column>
      {/* <>{JSON.stringify(props)}</> */}
      <ImageUploader
        src={image}
        onUpload={(img) => onChange(_id, 'image', img)}
      />
      <FormControl
        placeholder="Enter Title"
        name="title"
        value={title}
        onChange={handleChange}
      />
      <FormControl
        placeholder="Enter Subtitle"
        componentClass="textarea"
        name="subtitle"
        value={subtitle}
        onChange={handleChange}
      />
      <ButtonsGenerator _id={_id} buttons={buttons || []} onChange={onChange} />
    </Column>
  );
}

export default Card;
