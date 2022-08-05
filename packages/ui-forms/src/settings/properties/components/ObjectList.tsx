import { Button } from '@erxes/ui/src/components';
import { __ } from '@erxes/ui/src/utils/core';
import React, { useState, useEffect } from 'react';
import { ObjectListItemContainer } from '../styles';
import ObjectListItem from './ObjectListItem';
import { IObjectListConfig } from '@erxes/ui/src/types';

type Props = {
  objectListConfigs: IObjectListConfig[];
  value: any[];
  isEditing: boolean;
  onChange: (value: any[]) => void;
};

export default function ObjectList(props: Props) {
  const { value, objectListConfigs, onChange } = props;

  const [isEditing, setEditing] = useState(props.isEditing);
  const [objects, setObjects] = useState(value);
  const [currentIndex, setCurrentIndex] = useState(-1);

  useEffect(() => {
    setObjects(value);
    setEditing(props.isEditing);
  }, [value, props.isEditing, currentIndex, setCurrentIndex]);

  const onChangeValue = (index: number, key: string, values: any) => {
    const newObjects = [...objects];
    newObjects[index][key] = values;

    setObjects(newObjects);
    onChange(objects);
  };

  const onEdit = (index: number) => {
    setCurrentIndex(index);
    setEditing(true);
  };

  const onClickCancel = () => {
    setEditing(false);
  };

  const onClickRemove = () => {
    objects.splice(currentIndex, 1);

    setObjects(objects);
    onChange(objects);
    setEditing(false);
  };

  const renderButtons = (index: number) => {
    if (
      (typeof isEditing !== 'undefined' && !isEditing) ||
      index !== currentIndex
    ) {
      return null;
    }

    return (
      <>
        <Button
          btnStyle="simple"
          type="button"
          onClick={onClickCancel}
          icon="times-circle"
        >
          Discard
        </Button>
        <Button
          btnStyle="danger"
          type="button"
          onClick={onClickRemove}
          icon="minus-circle"
        >
          Remove
        </Button>
      </>
    );
  };

  return (
    <>
      {(objects || []).map((object, index) => (
        <ObjectListItemContainer key={index}>
          <ObjectListItem
            index={index}
            objectListConfigs={objectListConfigs}
            object={object}
            onEdit={onEdit}
            onChange={onChangeValue}
          />
          {renderButtons(index)}
        </ObjectListItemContainer>
      ))}
    </>
  );
}
