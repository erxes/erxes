import React from 'react';
import { SlotDetailStyled } from '../../../styles';
import { Button, ControlLabel, FormControl, FormGroup } from '@erxes/ui/src';

const SlotDetail = ({ handleChange, _id, name, code, handleBack, option }) => {
  const {
    borderRadius,
    width,
    height,
    top,
    left,
    color,
    rotateAngle,
    zIndex,
    isShape
  } = option || {};

  const onChange = (e, key, isMain, isNumber?: boolean) => {
    const target = e.currentTarget as HTMLInputElement;
    handleChange(
      { [key]: isNumber ? Number(target.value) : target.value },
      _id,
      isMain
    );
  };

  return (
    <SlotDetailStyled>
      <div className="slot-detail-title">Slot Detail</div>

      <FormGroup>
        <ControlLabel>Name</ControlLabel>
        <FormControl
          id="name"
          type="text"
          value={name || ''}
          onChange={e => onChange(e, 'name', true)}
        />
      </FormGroup>
      <FormGroup>
        <ControlLabel>Code</ControlLabel>
        <FormControl
          id="code"
          type="text"
          value={code || ''}
          onChange={e => onChange(e, 'code', true)}
        />
      </FormGroup>
      <FormGroup>
        <ControlLabel>Rounded</ControlLabel>
        <FormControl
          id="borderRadius"
          type="number"
          value={borderRadius || 0}
          onChange={e => onChange(e, 'borderRadius', false, true)}
        />
      </FormGroup>
      <FormGroup>
        <ControlLabel>Width</ControlLabel>
        <FormControl
          id="width"
          type="number"
          value={width || 0}
          onChange={e => onChange(e, 'width', false, true)}
        />
      </FormGroup>
      <FormGroup>
        <ControlLabel>Height</ControlLabel>
        <FormControl
          id="height"
          type="number"
          value={height || 0}
          onChange={e => onChange(e, 'height', false, true)}
        />
      </FormGroup>
      <FormGroup>
        <ControlLabel>Top</ControlLabel>
        <FormControl
          id="top"
          type="number"
          value={top || 0}
          onChange={e => onChange(e, 'top', false, true)}
        />
      </FormGroup>
      <FormGroup>
        <ControlLabel>Left</ControlLabel>
        <FormControl
          id="left"
          type="number"
          value={left || 0}
          onChange={e => onChange(e, 'left', false, true)}
        />
      </FormGroup>
      <FormGroup>
        <ControlLabel>Rotate Angle</ControlLabel>
        <FormControl
          id="rotateAngle"
          type="number"
          max={359}
          value={rotateAngle || 0}
          onChange={e =>
            handleChange(
              {
                rotateAngle:
                  Number((e.currentTarget as HTMLInputElement).value) < 360
                    ? Number((e.currentTarget as HTMLInputElement).value)
                    : rotateAngle
              },
              _id
            )
          }
        />
      </FormGroup>
      <FormGroup>
        <ControlLabel>Color</ControlLabel>
        <input
          id="color"
          type="color"
          value={color || '#6569DF'}
          onChange={e => handleChange({ color: e.target.value }, _id)}
        />
      </FormGroup>
      <FormGroup>
        <ControlLabel>Z-Index</ControlLabel>
        <FormControl
          id="zIndex"
          type="number"
          value={zIndex || 0}
          onChange={e => onChange(e, 'zIndex', false, true)}
        />
      </FormGroup>
      <FormGroup horizontal>
        <input
          id="isShape"
          type="checkbox"
          value={isShape || 0}
          onChange={e => handleChange({ isShape: e.target.checked }, _id)}
        />
        <label htmlFor="isShape">Disabled</label>
      </FormGroup>
      <Button onClick={handleBack} btnStyle="success" icon={'plus-circle'}>
        {'Save'}
      </Button>
    </SlotDetailStyled>
  );
};

export default SlotDetail;
