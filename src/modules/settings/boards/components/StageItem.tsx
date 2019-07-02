import { Button, FormControl } from 'modules/common/components';
import React from 'react';
import { PROBABILITY } from '../constants';
import { StageItemContainer } from '../styles';
import { IStage } from '../types';

type Props = {
  stage: IStage;
  remove: (stageId: string) => void;
  onChange: (stageId: string, e: any) => void;
  onKeyPress: (e: any) => void;
};

class StageItem extends React.Component<Props, {}> {
  render() {
    const { stage, onChange, onKeyPress, remove } = this.props;
    const probabilties = PROBABILITY.ALL;

    return (
      <StageItemContainer key={stage._id}>
        <FormControl
          defaultValue={stage.name}
          type="text"
          placeholder="Stage name"
          onKeyPress={onKeyPress}
          autoFocus={true}
          name="name"
          onChange={onChange.bind(this, stage._id)}
        />

        <FormControl
          defaultValue={stage.probability}
          componentClass="select"
          name="probability"
          onChange={onChange.bind(this, stage._id)}
        >
          {probabilties.map((p, index) => (
            <option key={index} value={p}>
              {p}
            </option>
          ))}
        </FormControl>

        <Button
          btnStyle="danger"
          size="small"
          onClick={remove.bind(this, stage._id)}
          icon="cancel-1"
        />
      </StageItemContainer>
    );
  }
}

export default StageItem;
