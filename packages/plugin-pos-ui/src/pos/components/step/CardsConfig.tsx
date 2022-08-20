import PerConfigs from '../cardsGroup/PerConfigs';
import React from 'react';
import { __, Alert, Button } from '@erxes/ui/src';
import { Block, FlexColumn, FlexItem, FlexRow } from '../../../styles';
import { IConfigsMap } from '../../../types';
import { IPos } from '../../../types';
import { LeftItem } from '@erxes/ui/src/components/step/styles';

type Props = {
  onChange: (name: 'cardsConfig', value: any) => void;
  pos?: IPos;
};
type State = {
  configsMap: IConfigsMap;
};
class CardsConfig extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    const configsMap =
      props.pos && props.pos.cardsConfig
        ? props.pos.cardsConfig
        : {
            cardsConfig: null
          };
    this.state = {
      configsMap: configsMap
    };
  }
  add = e => {
    e.preventDefault();
    const { configsMap } = this.state;

    if (!configsMap?.cardsConfig) {
      configsMap.cardsConfig = {};
    }

    configsMap.cardsConfig.newCardsConfig = {
      boardId: '',
      pipelineId: '',
      stageId: '',
      branchId: '',
      assignedUserIds: []
    };

    this.setState({ configsMap });
  };
  delete = (currentConfigKey: string) => {
    const { configsMap } = this.state;
    delete configsMap.cardsConfig[currentConfigKey];
    delete configsMap.cardsConfig['newEbarimtConfig'];

    this.setState({ configsMap });

    this.props.onChange('cardsConfig', configsMap);
    Alert.success('You successfully deleted stage in cards settings.');
  };
  renderContent(configs) {
    return Object.keys(configs).map(key => {
      return (
        <PerConfigs
          key={Math.floor(Math.random() * 10000000) + 1}
          configsMap={this.state.configsMap}
          config={configs[key]}
          currentConfigKey={key}
          save={this.props.onChange}
          delete={this.delete}
        />
      );
    });
  }
  renderCollapse() {
    const { configsMap } = this.state;
    const mapping = configsMap.cardsConfig || {};
    const actionButtons = (
      <Button
        btnStyle="primary"
        onClick={this.add}
        icon="plus"
        uppercase={false}
      >
        New config
      </Button>
    );
    return (
      <FlexRow>
        <LeftItem>
          {actionButtons}
          <br />
          <br />
          {this.renderContent(mapping)}
        </LeftItem>
      </FlexRow>
    );
  }
  render() {
    return (
      <FlexItem>
        <FlexColumn>
          <LeftItem>
            <Block>{this.renderCollapse()}</Block>
          </LeftItem>
        </FlexColumn>
      </FlexItem>
    );
  }
}
export default CardsConfig;
