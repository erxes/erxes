import * as React from 'react';

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

  const onFocus = (_event: any) => {
    onEdit(index);
  };

  const onChange = (e: any) => {
    props.onChange(index, e.target.id, e.target.value);
  };

  return (
    <>
      {entries.map((e: any) => {
        const key = e[0];
        const value: any = e[1] || '';

        if (!keys || !keys.includes(key)) {
          return null;
        }

        return (
          <>
            <p>{key}</p>
            <input
              id={key}
              type="text"
              value={value}
              placeholder={key}
              onChange={onChange}
              onFocus={onFocus}
              className="form-control"
            />
          </>
        );
      })}
    </>
  );
}
