import * as React from 'react';
import { IObjectListConfig } from '../types';

type Props = {
  objectListConfigs: IObjectListConfig[];
  object: any;
  index: number;
  onEdit: (index: number) => void;
  onChange: (index: number, key: string, value: any) => void;
};

export default function ObjectListItem(props: Props) {
  const { object, objectListConfigs, index, onEdit } = props;

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

        if (!objectListConfigs) {
          return null;
        }

        const config = objectListConfigs.find((c) => c.key === key);

        if (!config) {
          return null;
        }

        if (config.type === 'text') {
          return (
            <>
              <p>{config.label}</p>
              <input
                id={key}
                type="text"
                value={value}
                placeholder={`${config.label}`}
                onChange={onChange}
                onFocus={onFocus}
                className="form-control"
              />
            </>
          );
        }
        if (config.type === 'textarea') {
          return (
            <>
              <p>{config.label}</p>
              <textarea
                id={key}
                value={value}
                placeholder={`${config.label}`}
                onChange={onChange}
                onFocus={onFocus}
                className="form-control"
              />
            </>
          );
        }
      })}
    </>
  );
}
