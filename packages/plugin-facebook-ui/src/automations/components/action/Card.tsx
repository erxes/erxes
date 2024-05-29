import React, { useEffect, useState } from "react";

import ButtonsGenerator from "./ButtonGenerator";
import { Column } from "@erxes/ui/src/styles/main";
import FormControl from "@erxes/ui/src/components/form/Control";
import ImageUploader from "./ImageUpload";

function Card({ onChange, ...props }) {
  const [card, setCard] = useState(props.card || {});

  const {
    _id,
    buttons = [],
    image = "",
    title = "",
    subtitle = "",
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
      <ImageUploader
        src={image}
        onUpload={(img) => onChange(_id, "image", img)}
      />
      <FormControl
        placeholder="Enter Title"
        name="title"
        value={title}
        onChange={handleChange}
      />
      <FormControl
        placeholder="Enter Subtitle"
        componentclass="textarea"
        name="subtitle"
        value={subtitle}
        onChange={handleChange}
      />
      <ButtonsGenerator _id={_id} buttons={buttons || []} onChange={onChange} />
    </Column>
  );
}

export default Card;
