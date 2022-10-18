import { useState, useEffect } from 'react';
import * as React from 'react';
import ObjectListItem from './ObjectListItem';
import { IObjectListConfig } from '../types';

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
        <button
          type="button"
          className="erxes-objectlist-cancel-button"
          onClick={onClickCancel}
        >
          Discard
        </button>
        <button
          type="button"
          className="erxes-objectlist-button"
          onClick={onClickRemove}
        >
          Remove
        </button>
      </>
    );
  };

  return (
    <>
      {(objects || []).map((object, index) => (
        <div className="object-list-item" key={index}>
          <ObjectListItem
            key={index}
            index={index}
            objectListConfigs={objectListConfigs}
            object={object}
            onEdit={onEdit}
            onChange={onChangeValue}
          />
          {renderButtons(index)}
        </div>
      ))}
    </>
  );
}
