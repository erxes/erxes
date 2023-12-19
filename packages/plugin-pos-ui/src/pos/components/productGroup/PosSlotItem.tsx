import React from 'react';
import { SlotListItem as StyledSlotListItem } from '../../../styles';
import { Button, Icon, Tip, __ } from '@erxes/ui/src';

const PosSlotItem = ({
  setActiveSlot,
  _id,
  name,
  code,
  option,
  posId,
  setSlots
}) => {
  const deleteSlot = () => setSlots(prev => prev.filter(sl => sl._id !== _id));

  const copySlot = () => {
    const copyId = Math.random().toString();
    setSlots(prev => [
      ...(prev || []),
      {
        _id: copyId,
        name: `${name}Copy`,
        code: `${code}Copy`,
        posId,
        option: {
          ...(option || {}),
          top: option.top + 20,
          left: option.left + 20
        }
      }
    ]);
    setActiveSlot(copyId);
  };
  return (
    <StyledSlotListItem>
      <strong>
        {code} - {name}
      </strong>
      <div className="actions">
        <Button btnStyle="link" onClick={copySlot}>
          <Tip text={__('Copy')} placement="top">
            <Icon icon="copy" />
          </Tip>
        </Button>
        <Button btnStyle="link" onClick={() => setActiveSlot(_id)}>
          <Tip text={__('Manage')} placement="top">
            <Icon icon="edit-3" />
          </Tip>
        </Button>
        <Button btnStyle="danger" onClick={deleteSlot}>
          <Tip text={__('Delete')} placement="top">
            <Icon icon="trash" />
          </Tip>
        </Button>
      </div>
    </StyledSlotListItem>
  );
};

export default PosSlotItem;
