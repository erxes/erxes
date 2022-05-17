import { FormControl } from '@erxes/ui/src/components/form';
import { __ } from '@erxes/ui/src/utils/core';
import React from 'react';

type Props = {
  keys: string[];
  object: any;
  index: number;
  onEdit: (index: number) => void;
  onChange: (index: number, key: string, value: any) => void;
};

export default function ObjectListItem(props: Props) {
  const { object, keys, index, onEdit } = props;

  const entries = Object.entries(object);

  const onFocus = _event => {
    onEdit(index);
  };

  const onChange = e => {
    props.onChange(index, e.target.id, e.target.value);
  };

  return (
    <>
      {entries.map(e => {
        const key = e[0];
        const value: any = e[1] || '';

        if (!keys || !keys.includes(key)) {
          return null;
        }

        return (
          <>
            <p>{key}</p>
            <FormControl
              id={key}
              type="text"
              value={value}
              placeholder={key}
              onChange={onChange}
              onFocus={onFocus}
            />
          </>
        );
      })}
    </>
  );
}
