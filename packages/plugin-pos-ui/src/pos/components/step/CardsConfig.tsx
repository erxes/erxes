import React from 'react';
import { IPos } from '../../../types';
import {
  __,
  ControlLabel,
  Label,
  FormControl,
  FormGroup,
  Toggle
} from '@erxes/ui/src';
import {
  DomainRow,
  FlexColumn,
  FlexItem,
  Row,
  Block,
  BlockRow,
  BlockRowUp
} from '../../../styles';
import { LeftItem } from '@erxes/ui/src/components/step/styles';
import BoardSelectContainer from '@erxes/ui-cards/src/boards/containers/BoardSelect';
type Props = {
  onChange: (name: 'cardsConfig', value: any) => void;
  pos?: IPos;
};
class CardsConfig extends React.Component<Props, { config: any }> {
  constructor(props: Props) {
    super(props);

    const config =
      props.pos && props.pos.cardsConfig
        ? props.pos.cardsConfig
        : {
            isSyncCards: false,
            boardId: '',
            pipelineId: '',
            stageId: '',
            name: '',
            assignedUserIds: []
          };

    this.state = {
      config
    };
  }
  onChangeConfig = (code: string, value) => {
    const { config } = this.state;
    config[code] = value;

    this.setState({ config }, () => {
      this.props.onChange('cardsConfig', config);
    });
  };
  onChangeSwitch = e => {
    this.onChangeConfig('isSyncCards', e.target.checked);
  };
  renderOther() {
    const { config } = this.state;

    const onChangeBoard = (boardId: string) => {
      this.onChangeConfig('boardId', boardId);
    };

    const onChangePipeline = (pipelineId: string) => {
      this.onChangeConfig('pipelineId', pipelineId);
    };

    const onChangeStage = (stageId: string) => {
      this.onChangeConfig('stageId', stageId);
    };

    if (!this.state.config.isSyncCards) {
      return <></>;
    }
    return (
      <BoardSelectContainer
        type="deal"
        autoSelectStage={false}
        boardId={config.boardId}
        pipelineId={config.pipelineId}
        stageId={config.stageId}
        onChangeBoard={onChangeBoard}
        onChangePipeline={onChangePipeline}
        onChangeStage={onChangeStage}
      />
    );
  }
  render() {
    return (
      <FlexItem>
        <FlexColumn>
          <LeftItem>
            <Block>
              <h4>{__('Main')}</h4>
              <BlockRow>
                <FormGroup>
                  <ControlLabel>Is Sync Cards</ControlLabel>
                  <Toggle
                    id={'isSyncCards'}
                    checked={this.state.config.isSyncCards || false}
                    onChange={this.onChangeSwitch}
                    icons={{
                      checked: <span>Yes</span>,
                      unchecked: <span>No</span>
                    }}
                  />
                </FormGroup>
              </BlockRow>
            </Block>
            {this.renderOther()}
            <Block />
          </LeftItem>
        </FlexColumn>
      </FlexItem>
    );
  }
}
export default CardsConfig;
