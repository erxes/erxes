import React from 'react';
import { IPos } from '../../../types';
import { queries as formQueries } from '@erxes/ui-forms/src/forms/graphql';
import gql from 'graphql-tag';
import client from '@erxes/ui/src/apolloClient';
import { FieldsCombinedByType } from '@erxes/ui-settings/src/properties/types';
import Modal from 'react-bootstrap/Modal';
import {
  __,
  ControlLabel,
  FormGroup,
  Toggle,
  SelectTeamMembers,
  Button,
  ModalTrigger,
  Wrapper
} from '@erxes/ui/src';
import {
  DomainRow,
  FlexColumn,
  FlexRow,
  FlexItem,
  Block,
  BlockRow
} from '../../../styles';
import { isEnabled } from '@erxes/ui/src/utils/core';
import { LeftItem } from '@erxes/ui/src/components/step/styles';
import BoardSelectContainer from '@erxes/ui-cards/src/boards/containers/BoardSelect';
import SelectBranches from '@erxes/ui/src/team/containers/SelectBranches';
import { Title } from '@erxes/ui-settings/src/styles';
import { IConfigsMap } from '../../../../../plugin-ebarimt-ui/src/types';
type Props = {
  onChange: (name: 'cardsConfig', value: any) => void;
  pos?: IPos;
  configsMap: IConfigsMap;
};
type State = {
  config: any;
  configsMap: IConfigsMap;
};
class CardsConfig extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    const config =
      props.pos && props.pos.cardsConfig
        ? props.pos.cardsConfig
        : {
            isSyncCards: false,
            configsMap: {}
          };
    this.state = {
      config,
      configsMap: props.configsMap
    };
  }
  onChangeConfig = (code: string, value) => {
    const { config, configsMap } = this.state;
    configsMap[code] = value;
    this.setState({ config }, () => {
      this.props.onChange('cardsConfig', config);
    });
  };
  add = e => {
    e.preventDefault();
    const { configsMap } = this.state;

    if (!configsMap.cardsConfig) {
      configsMap.cardsConfig = {};
    }

    // must save prev item saved then new item
    configsMap.cardsConfig.newCardsConfig = {
      boardId: '',
      pipelineId: '',
      stageId: '',
      branchId: '',
      assignedUserIds: []
    };

    this.setState({ configsMap });
  };
  onChangeSwitch = e => {
    this.onChangeConfig('isSyncCards', e.target.checked);
  };
  renderContent() {
    return <>Content</>;
  }

  renderCollapse() {
    const { config } = this.state;
    if (!this.state.config.isSyncCards) {
      return <></>;
    }
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
          {this.renderContent()}
        </LeftItem>
      </FlexRow>
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
            {this.renderCollapse()}
            <Block />
          </LeftItem>
        </FlexColumn>
      </FlexItem>
    );
  }
}
export default CardsConfig;
