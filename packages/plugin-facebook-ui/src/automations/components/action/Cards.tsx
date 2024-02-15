import Button from '@erxes/ui/src/components/Button';
import Icon from '@erxes/ui/src/components/Icon';
import { TabTitle, Tabs } from '@erxes/ui/src/components/tabs/index';
import { __ } from '@erxes/ui/src/utils/core';
import React, { useState } from 'react';
import { TabAction } from './ReplyFbMessage';
import Card from './Card';

const generateSelectedPageId = (cards: any[]) => {
  return cards[0]?._id || '';
};

function Cards({ cards, onChange }) {
  const [selectedPageId, setSelectedPageId] = useState(
    generateSelectedPageId(cards || []),
  );

  const selectedPage = cards.find((card) => card._id === selectedPageId);

  const onSelectTab = (id) => {
    setSelectedPageId(id);
  };

  const handleRemovePage = (_id) => {
    const filteredCards = cards.filter((card) => card._id !== _id);

    onChange(filteredCards);
  };

  const addPage = () => {
    const _id = Math.random().toString();

    onChange([
      ...cards,
      {
        _id,
        label: `Page ${(cards?.length || 0) + 1}`,
      },
    ]);
    setSelectedPageId(_id);
  };

  const handleChange = (_id, name, value) => {
    const updatedCards = cards.map((card) =>
      card._id === _id ? { ...card, [name]: value } : card,
    );

    onChange(updatedCards);
  };

  return (
    <div>
      <Tabs>
        {cards.map(({ _id, label }) => (
          <TabTitle
            key={_id}
            className={_id === selectedPageId ? 'active' : ''}
            onClick={() => onSelectTab(_id)}
          >
            {__(label)}
            <TabAction onClick={() => handleRemovePage(_id)}>
              <Icon icon="times-circle" />
            </TabAction>
          </TabTitle>
        ))}
        <Button btnStyle="link" icon="focus-add" onClick={addPage} />
      </Tabs>

      {selectedPage && <Card card={selectedPage} onChange={handleChange} />}
    </div>
  );
}

export default Cards;
