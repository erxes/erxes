import React, { useEffect, useState } from "react";

import ButtonsGenerator from "./ButtonGenerator";
import { Column } from "@erxes/ui/src/styles/main";
import FormControl from "@erxes/ui/src/components/form/Control";
import ImageUploader from "./ImageUpload";
import { FieldInfo } from "../../styles";

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

    if(value?.length > 80){
      return 
    }

    onChange(_id, name, value);
  };

  return (
    <Column>
      <ImageUploader
        src={image}
        onUpload={(img) => onChange(_id, 'image', img)}
        limit="5MB"
      />
      <FieldInfo
        error={title?.length >= 80}
      >{`${title?.length || 0}/80`}</FieldInfo>
      <FormControl
        placeholder="Enter Title"
        name="title"
        value={title}
        onChange={handleChange}
      />
      <FieldInfo
        error={subtitle?.length >= 80}
      >{`${subtitle?.length || 0}/80`}</FieldInfo>
      <FormControl
        placeholder="Enter Subtitle"
        componentclass="textarea"
        name="subtitle"
        value={subtitle}
        onChange={handleChange}
      />
      <ButtonsGenerator
        _id={_id}
        buttons={buttons || []}
        onChange={onChange}
        limit={3}
      />
    </Column>
  );
}

export default Card;
