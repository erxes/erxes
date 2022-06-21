import React from 'react';
import { IPos } from '../../../types';
import { queries as formQueries } from '@erxes/ui-forms/src/forms/graphql';
import gql from 'graphql-tag';
import client from '@erxes/ui/src/apolloClient';
import { FieldsCombinedByType } from '@erxes/ui-settings/src/properties/types';
import {
  __,
  ControlLabel,
  Label,
  FormControl,
  FormGroup,
  Toggle,
  SelectTeamMembers
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
import { isEnabled } from '@erxes/ui/src/utils/core';
import { LeftItem } from '@erxes/ui/src/components/step/styles';
import BoardSelectContainer from '@erxes/ui-cards/src/boards/containers/BoardSelect';
type Props = {
  onChange: (name: 'cardsConfig', value: any) => void;
  pos?: IPos;
};
class CardsConfig extends React.Component<
  Props,
  { config: any; fieldsCombined: FieldsCombinedByType[] }
> {
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

    let fieldsCombined = [];

    if (isEnabled('forms')) {
      client
        .query({
          query: gql(formQueries.fieldsCombinedByContentType),
          variables: {
            contentType: 'deal'
          }
        })
        .then(({ data }) => {
          this.setState({
            fieldsCombined: data ? data.fieldsCombinedByContentType : [] || []
          });
        });

      this.setState({ fieldsCombined });
    }

    this.state = {
      config,
      fieldsCombined: []
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
    const { config, fieldsCombined } = this.state;

    const onChangeBoard = (boardId: string) => {
      this.onChangeConfig('boardId', boardId);
    };

    const onChangePipeline = (pipelineId: string) => {
      this.onChangeConfig('pipelineId', pipelineId);
    };

    const onChangeStage = (stageId: string) => {
      this.onChangeConfig('stageId', stageId);
    };

    const onAssignedUsersSelect = users => {
      this.onChangeConfig('assignedUserIds', users);
    };

    if (!this.state.config.isSyncCards) {
      return <></>;
    }
    return (
      <FlexItem>
        <FlexColumn>
          <LeftItem>
            {(isEnabled('cards') && (
              <Block>
                <h4>{__('Stage')}</h4>
                <BlockRow>
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
                </BlockRow>
              </Block>
            )) ||
              'Please, enabled cards plugin'}
            <Block>
              <h4>{__('Deal users')}</h4>
              <BlockRow>
                <FormGroup>
                  <ControlLabel>{__('Assigned Users')}</ControlLabel>
                  <SelectTeamMembers
                    label={__('Choose team member')}
                    name="assignedUserIds"
                    initialValue={config.assignedUserIds}
                    onSelect={onAssignedUsersSelect}
                  />
                </FormGroup>
              </BlockRow>
            </Block>
          </LeftItem>
        </FlexColumn>
      </FlexItem>
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
