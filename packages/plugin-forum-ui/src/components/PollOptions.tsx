import React from 'react';

type PollOption = {
  _id: string;
  title: string;
  order: number;
  isNew?: boolean;
};

type OnChangeHandler = (_id: string, title: string, order: number) => void;

type Props = {
  options: PollOption[];
  onChange: OnChangeHandler;
  onAdd: () => void;
  onRemove: (_id: string) => void;
};

const PollOptions: React.FC<Props> = ({
  options,
  onChange,
  onAdd,
  onRemove
}) => {
  return (
    <div>
      {options.map(({ _id, title, order }) => (
        <div key={_id}>
          <input
            type="text"
            value={title}
            placeholder="title"
            onChange={e => onChange(_id, e.target.value, order)}
          />
          <input
            type="number"
            value={order}
            placeholder="order"
            onChange={e => onChange(_id, title, Number(e.target.value))}
          />
          <button type="button" onClick={() => onRemove(_id)}>
            remove
          </button>
        </div>
      ))}

      <div>
        <button type="button" onClick={onAdd}>
          Add option
        </button>
      </div>
    </div>
  );
};

export default PollOptions;
