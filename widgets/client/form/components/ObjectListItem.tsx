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
  const keys = Object.keys(object);

  const onChange = (e: any) => {
    props.onChange(index, e.target.id, e.target.value);
  };

  const onFocus = (_event: any) => {
    onEdit(index);
  };

  return (
    <>
      {keys.map((key: string) => {
        const value: any = object[key] || '';

        if (!objectListConfigs) {
          return null;
        }

        const config = objectListConfigs.find((c) => c.key === key);

        if (!config) {
          return null;
        }

        if (config.type === 'text') {
          return (
            <form>
              <p>{config.label}</p>
              <label>
                <input
                  id={key}
                  type="text"
                  value={value}
                  // state[key] ||
                  placeholder={`${config.label}`}
                  onChange={onChange}
                  onFocus={onFocus}
                  className="form-control"
                />
              </label>
            </form>
          );
        }
        if (config.type === 'textarea') {
          return (
            <form>
              <p>{config.label}</p>
              <label>
                <textarea
                  id={key}
                  value={value}
                  placeholder={`${config.label}`}
                  onChange={onChange}
                  onFocus={onFocus}
                  className="form-control"
                />
              </label>
            </form>
          );
        }
      })}
    </>
  );
}
