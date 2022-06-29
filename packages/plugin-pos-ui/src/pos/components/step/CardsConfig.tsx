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
  ModalTrigger
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
            mappings: [
              {
                _id: Math.floor(100000 + Math.random() * 900000).toString(),
                branchIds: [],
                boardId: '',
                pipelineId: '',
                stageId: '',
                assignedUserIds: []
              }
            ]
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
  onChangeMap = (code: string, value, _id) => {
    const { config } = this.state;
    config['mappings'].map(item => {
      if (item?._id == _id) {
        item[code] = value;
      }
    });
    this.setState({ config }, () => {
      this.props.onChange('cardsConfig', config);
    });
  };
  onChangeSwitch = e => {
    this.onChangeConfig('isSyncCards', e.target.checked);
  };
  renderOther(_id: string) {
    const { config } = this.state;

    const onChangeBoard = (boardId: string) => {
      this.onChangeMap('boardId', boardId, _id);
    };

    const onChangePipeline = (pipelineId: string) => {
      this.onChangeMap('pipelineId', pipelineId, _id);
    };

    const onChangeStage = (stageId: string) => {
      this.onChangeMap('stageId', stageId, _id);
    };

    const onAssignedUsersSelect = users => {
      this.onChangeMap('assignedUserIds', users, _id);
    };

    const onBranchesSelect = users => {
      this.onChangeMap('branchIds', users, _id);
    };

    if (!this.state.config.isSyncCards) {
      return <></>;
    }
    const getMapping = (code: string) => {
      return config.mappings.find(item => item._id == _id)[code];
    };
    const removeMapping = () => {
      const curr_map = config.mappings.find(item => (item._id = _id));
      const index = config.mappings.indexOf(curr_map);
      if (index > -1) {
        config.mappings.splice(index, 1);
      }
    };
    const renderBoardContainer = props => {
      const onClickSave = () => {
        props.closeModal();
      };
      const onClickCancel = () => {
        props.closeModal();
      };
      return (
        <>
          <BoardSelectContainer
            type="deal"
            autoSelectStage={false}
            boardId={getMapping('boardId')}
            pipelineId={getMapping('pipelineId')}
            stageId={getMapping('stageId')}
            onChangeBoard={onChangeBoard}
            onChangePipeline={onChangePipeline}
            onChangeStage={onChangeStage}
          />
          <Modal.Footer>
            <Button
              onClick={onClickSave}
              btnStyle="success"
              icon={'check-circle'}
            >
              Save
            </Button>
            <Button
              btnStyle="simple"
              type="button"
              icon="times-circle"
              onClick={onClickCancel}
            >
              Cancel
            </Button>
          </Modal.Footer>
        </>
      );
    };
    return (
      <FlexRow>
        <LeftItem>
          <Block>
            <BlockRow>
              <FormGroup>
                <ControlLabel>Branch</ControlLabel>
                <SelectBranches
                  label={__('Choose branch')}
                  name="branchIds"
                  initialValue={getMapping('')}
                  onSelect={onBranchesSelect}
                />
              </FormGroup>
              {(isEnabled('cards') && (
                <FormGroup>
                  <ControlLabel>Stage</ControlLabel>
                  <br />
                  <ModalTrigger
                    title="Add stage"
                    trigger={
                      <Button btnStyle="primary" icon="plus-circle">
                        Add stage
                      </Button>
                    }
                    content={renderBoardContainer}
                  ></ModalTrigger>
                </FormGroup>
              )) ||
                'Please, enabled cards plugin'}
              <FormGroup>
                <ControlLabel>{__('Assigned Users')}</ControlLabel>
                <SelectTeamMembers
                  label={__('Choose team member')}
                  name="assignedUserIds"
                  initialValue={getMapping('assignedUserIds')}
                  onSelect={onAssignedUsersSelect}
                />
              </FormGroup>
              <Button btnStyle="danger" icon="trash" onClick={removeMapping} />
            </BlockRow>
          </Block>
        </LeftItem>
      </FlexRow>
    );
  }
  renderEach(item: any) {
    return this.renderOther(item?._id);
  }
  renderMaps() {
    const { config } = this.state;
    if (!this.state.config.isSyncCards) {
      return <></>;
    }
    const addIndex = () => {
      const temp = config;
      temp.mappings?.push({
        _id: Math.floor(100000 + Math.random() * 900000).toString(),
        branchIds: [],
        boardId: '',
        pipelineId: '',
        stageId: '',
        assignedUserIds: []
      });
      this.setState({
        config: temp
      });
      console.log(config);
    };
    return (
      <>
        {config.mappings?.map(item => this.renderEach(item))}
        <Button btnStyle="primary" icon="plus-circle" onClick={addIndex}>
          Add mapping
        </Button>
      </>
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
            {this.renderMaps()}
            <Block />
          </LeftItem>
        </FlexColumn>
      </FlexItem>
    );
  }
}
export default CardsConfig;
