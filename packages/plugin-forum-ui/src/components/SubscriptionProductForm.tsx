import React, { useState } from 'react';

type Props = {
  subscriptionProduct?: {
    _id: string;
    name?: string | null;
    description?: string | null;
    listOrder: number;
    multiplier: number;
    price: number;
    unit: string;
  };
  onSubmit?: (val: any) => any;
};

const timeDuractionUnits = ['days', 'weeks', 'months', 'years'];

const SubscriptionProductForm: React.FC<Props> = ({
  subscriptionProduct,
  onSubmit
}) => {
  const [name, setName] = useState(subscriptionProduct?.name || '');
  const [description, setDescription] = useState(
    subscriptionProduct?.description || ''
  );
  const [listOrder, setListOrder] = useState(
    subscriptionProduct?.listOrder || 0
  );
  const [multiplier, setMultiplier] = useState(
    subscriptionProduct?.multiplier || 1
  );
  const [price, setPrice] = useState(subscriptionProduct?.price || 0);
  const [unit, setUnit] = useState(subscriptionProduct?.unit || 'months');

  const _onSubmit = e => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit({
        name: name || null,
        description: description || null,
        listOrder,
        multiplier,
        price,
        unit
      });
    }
  };

  return (
    <form onSubmit={_onSubmit}>
      <label>
        Name:{' '}
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
        />
      </label>
      <br />
      <label>
        Description:{' '}
        <input
          type="text"
          value={description}
          onChange={e => setDescription(e.target.value)}
        />
      </label>
      <br />
      <label>
        Multiplier:{' '}
        <input
          type="number"
          value={multiplier}
          onChange={e => setMultiplier(parseInt(e.target.value))}
        />
      </label>
      <label>
        Unit:{' '}
        <select value={unit} onChange={e => setUnit(e.target.value)}>
          {timeDuractionUnits.map(unit => (
            <option key={unit} value={unit}>
              {unit}
            </option>
          ))}
        </select>
      </label>
      <br />
      <label>
        Price:{' '}
        <input
          type="number"
          value={price}
          onChange={e => setPrice(parseInt(e.target.value))}
        />
      </label>
      <br />
      <label>
        List order:{' '}
        <input
          type="number"
          value={listOrder}
          onChange={e => setListOrder(parseInt(e.target.value))}
        />
      </label>
      <input type="submit" value="Submit" />
    </form>
  );
};

export default SubscriptionProductForm;
