import React, { useState } from 'react';
import { Block, BlockRow, PosSlotContainer, SlotList } from '../../../styles';
import {
  Button,
  ControlLabel,
  FormGroup,
  ModalTrigger,
  __
} from '@erxes/ui/src';
import PosSlotItem from './PosSlotItem';
import PosSlotHall from './posSlotHall';
import SlotDetail from './posSlotDetail';

export interface ISlot {}

const PosSlotPlan = ({ slots: savedSlots, onSave, posId }) => {
  const cleanedSlot = savedSlots.map(sl => {
    const { _id, name, code, posId, option } = sl || {};
    const {
      width,
      height,
      top,
      left,
      rotateAngle,
      borderRadius,
      color,
      zIndex
    } = option || {};

    return {
      _id,
      name,
      code,
      posId,
      option: {
        width: width || 100,
        height: height || 100,
        top: top || 100,
        left: left || 100,
        rotateAngle: rotateAngle || 0,
        borderRadius: borderRadius || 0,
        color: color || '#6569DF',
        zIndex: zIndex || 0
      }
    };
  });
  const [slots, setSlots] = useState(cleanedSlot || []);
  const [activeSlot, setActiveSlot] = useState<string | null>(null);
  const slotTrigger = <button>{cleanedSlot.length}</button>;

  const addSlot = () => {
    const _id = Math.random().toString();
    setSlots(prev => [
      ...prev,
      {
        _id,
        name: '',
        code: '',
        posId,
        option: {
          width: 100,
          height: 100,
          top: 100,
          left: 100,
          rotateAngle: 0,
          borderRadius: 0,
          color: '#673FBD',
          zIndex: 0,
          isShape: false
        }
      }
    ]);
    setActiveSlot(_id);
  };

  const handleBack = () => setActiveSlot(null);

  const handleChange = (property, _id, main) =>
    setSlots(prev =>
      (prev || []).map(sl => {
        if (sl._id === _id) {
          if (main) {
            return {
              ...sl,
              ...property
            };
          }
          return {
            ...sl,
            option: {
              ...sl.option,
              ...property
            }
          };
        }
        return sl;
      })
    );

  const cleanedSlots = slots.filter(sl => !!sl.code);

  const renderContent = props => (
    <>
      <PosSlotContainer>
        <PosSlotHall
          handleBack={handleBack}
          slots={slots}
          handleChange={handleChange}
          activeSlot={activeSlot}
          setActiveSlot={setActiveSlot}
        />
        {!!activeSlot ? (
          <SlotDetail
            {...slots.find(sl => sl._id === activeSlot)}
            handleChange={handleChange}
            handleBack={handleBack}
          />
        ) : (
          <SlotList>
            {slots.map(sl => (
              <PosSlotItem
                {...sl}
                key={sl._id}
                setActiveSlot={setActiveSlot}
                setSlots={setSlots}
              />
            ))}
            <div className="slots-actions">
              <Button btnStyle="primary" icon="plus-circle" onClick={addSlot}>
                Add
              </Button>
              <Button
                onClick={() => {
                  setSlots(cleanedSlots);
                  onSave(cleanedSlots);
                  props.closeModal();
                }}
                btnStyle="success"
                icon={'plus-circle'}
              >
                {'Save'}
              </Button>
            </div>
          </SlotList>
        )}
      </PosSlotContainer>
    </>
  );

  return (
    <Block>
      <BlockRow>
        <FormGroup>
          <ControlLabel>Slots:</ControlLabel>
        </FormGroup>
        <FormGroup>
          <ModalTrigger
            title={'Slots'}
            size="xl"
            trigger={slotTrigger}
            content={renderContent}
          />
        </FormGroup>
      </BlockRow>
    </Block>
  );
};

export default PosSlotPlan;
