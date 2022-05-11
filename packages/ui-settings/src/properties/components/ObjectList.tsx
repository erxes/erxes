import { Button } from '@erxes/ui/src/components';
import { __ } from '@erxes/ui/src/utils/core';
import React, { useState, useEffect } from 'react';
import ObjectListItem from './ObjectListItem';

type Props = {
  keys: string[];
  value: any[];
};

export default function ObjectList(props: Props) {
  const { value, keys } = props;

  const [isEditing, setEditing] = useState(false);
  const [objects, setObjects] = useState(value);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    setObjects(value);
  }, [value]);

  const onChange = (index: number, key: string, value: any) => {
    const newObjects = [...objects];
    newObjects[index][key] = value;
    setObjects(newObjects);

    console.log(objects);
  };

  const onEdit = (index: number) => {
    setCurrentIndex(index);
    setEditing(true);
  };

  const onClickCancel = () => {
    setEditing(false);
  };

  const onClickRemove = () => {
    setEditing(false);
  };

  const onClickSAve = () => {
    setEditing(false);
  };

  const renderButtons = (index: number) => {
    if (!isEditing || index !== currentIndex) {
      return null;
    }

    return (
      <>
        <Button
          id="cancel"
          btnStyle="simple"
          type="button"
          onClick={onClickCancel}
          icon="times-circle"
        ></Button>
        <Button
          id="remove"
          btnStyle="danger"
          type="button"
          onClick={onClickRemove}
          icon="minus-circle"
        ></Button>
        <Button
          id="save"
          onClick={onClickSAve}
          type="submit"
          btnStyle="success"
          icon="check-circle"
        ></Button>
      </>
    );
  };

  return (objects || []).map((object, index) => (
    <>
      <ObjectListItem
        index={index}
        keys={keys}
        object={object}
        onEdit={onEdit}
        onChange={onChange}
      />
      {renderButtons(index)}
    </>
  ));
}
