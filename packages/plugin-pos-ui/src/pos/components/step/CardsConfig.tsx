import { queries as formQueries } from '@erxes/ui-forms/src/forms/graphql';
import { FieldsCombinedByType } from '@erxes/ui-forms/src/settings/properties/types';
import { Alert, Button, __ } from '@erxes/ui/src';
import client from '@erxes/ui/src/apolloClient';
import { LeftItem } from '@erxes/ui/src/components/step/styles';
import { isEnabled } from '@erxes/ui/src/utils/core';
import { gql } from '@apollo/client';
import React from 'react';
import { Block, FlexColumn, FlexItem, FlexRow } from '../../../styles';
import { IConfigsMap, IPos } from '../../../types';
import PerConfigs from '../cardsGroup/PerConfigs';

type Props = {
  onChange: (name: 'cardsConfig', value: any) => void;
  pos?: IPos;
};
type State = {
  cardsConfig: IConfigsMap;
  fieldsCombined: FieldsCombinedByType[];
};
class CardsConfig extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    const configsMap =
      props.pos && props.pos.cardsConfig ? props.pos.cardsConfig : {};
    this.state = {
      cardsConfig: configsMap,
      fieldsCombined: []
    };

    if (isEnabled('forms')) {
      client
        .query({
          query: gql(formQueries.fieldsCombinedByContentType),
          variables: {
            contentType: 'cards:deal'
          }
        })
        .then(({ data }) => {
          this.setState({
            fieldsCombined: data ? data.fieldsCombinedByContentType : [] || []
          });
        });
    }
  }

  add = e => {
    e.preventDefault();
    const { cardsConfig } = this.state;

    cardsConfig.newCardsConfig = {
      branchId: '',
      boardId: '',
      pipelineId: '',
      stageId: '',
      assignedUserIds: [],
      deliveryMapField: ''
    };

    this.setState({ cardsConfig });
  };

  delete = (currentConfigKey: string) => {
    const { cardsConfig } = this.state;
    delete cardsConfig[currentConfigKey];

    this.setState({ cardsConfig }, () => {
      this.props.onChange('cardsConfig', cardsConfig);
    });

    Alert.success('You successfully deleted stage in cards settings.');
  };

  edit = (key, currenConfig: any) => {
    const { cardsConfig } = this.state;

    delete cardsConfig[key];
    cardsConfig[currenConfig.branchId] = { ...currenConfig };

    this.setState({ cardsConfig }, () => {
      this.props.onChange('cardsConfig', cardsConfig);
    });
  };

  renderCollapse() {
    const { cardsConfig, fieldsCombined } = this.state;

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
          {Object.keys(cardsConfig).map(key => (
            <PerConfigs
              key={key}
              config={cardsConfig[key]}
              fieldsCombined={fieldsCombined}
              configKey={key}
              save={this.edit}
              delete={this.delete}
            />
          ))}
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
