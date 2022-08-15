import { Block, BlockRow, FlexColumn, FlexItem } from '../../../styles';
import { ControlLabel, FormGroup, SelectTeamMembers, __ } from '@erxes/ui/src';

import BoardSelectContainer from '@erxes/ui-cards/src/boards/containers/BoardSelect';
import { FieldsCombinedByType } from '@erxes/ui-forms/src/settings/properties/types';
import { IPos } from '../../../types';
import { LeftItem } from '@erxes/ui/src/components/step/styles';
import React from 'react';
import Select from 'react-select-plus';
import Spinner from '@erxes/ui/src/components/Spinner';
import client from '@erxes/ui/src/apolloClient';
import { queries as formQueries } from '@erxes/ui-forms/src/forms/graphql';
import gql from 'graphql-tag';
import { isEnabled } from '@erxes/ui/src/utils/core';
import SelectProducts from '@erxes/ui-products/src/containers/SelectProducts';

type Props = {
  onChange: (name: 'deliveryConfig', value: any) => void;
  pos?: IPos;
};

class DeliveryConfig extends React.Component<
  Props,
  { config: any; fieldsCombined: FieldsCombinedByType[] }
> {
  constructor(props: Props) {
    super(props);

    const config =
      props.pos && props.pos.deliveryConfig
        ? props.pos.deliveryConfig
        : {
            boardId: '',
            pipelineId: '',
            stageId: '',
            watchedUserIds: [],
            assignedUserIds: [],
            productId: ''
          };

    let fieldsCombined = [];

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
      this.props.onChange('deliveryConfig', config);
    });
  };

  selectConfigOptions = (array: string[] = [], CONSTANT: any) => {
    return array.map(item => ({
      value: item,
      label: CONSTANT.find(el => el.value === item).label
    }));
  };

  render() {
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

    const onWatchedUsersSelect = users => {
      this.onChangeConfig('watchedUserIds', users);
    };

    const onAssignedUsersSelect = users => {
      this.onChangeConfig('assignedUserIds', users);
    };

    const onMapCustomFieldChange = option => {
      const value = !option ? '' : option.value.toString();
      this.onChangeConfig('mapCustomField', value);
    };

    const onChangeProduct = option => {
      this.onChangeConfig('productId', option);
    };

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
                <BlockRow>
                  <FormGroup>
                    <ControlLabel>{__('Choose map field')}</ControlLabel>
                    <Select
                      name="mapCustomField"
                      value={config.mapCustomField}
                      onChange={onMapCustomFieldChange}
                      options={(fieldsCombined || []).map(f => ({
                        value: f.name,
                        label: f.label
                      }))}
                    />
                  </FormGroup>
                </BlockRow>
              </Block>
            )) ||
              'Please, enabled cards plugin'}
            <Block>
              <h4>{__('Deal users')}</h4>
              <BlockRow>
                <FormGroup>
                  <ControlLabel>{__('Watched Users')}</ControlLabel>
                  <SelectTeamMembers
                    label={__('Choose team member')}
                    name="watchedUserIds"
                    initialValue={config.watchedUserIds}
                    onSelect={onWatchedUsersSelect}
                  />
                </FormGroup>
              </BlockRow>
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
              <BlockRow>
                <FormGroup>
                  <ControlLabel>{__('Delivery product')}</ControlLabel>
                  <SelectProducts
                    label={__('Choose delivery product')}
                    name="product"
                    initialValue={config.productId}
                    multi={false}
                    onSelect={onChangeProduct}
                  />
                </FormGroup>
              </BlockRow>
            </Block>
          </LeftItem>
        </FlexColumn>
      </FlexItem>
    );
  }
}

export default DeliveryConfig;
