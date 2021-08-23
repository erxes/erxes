import BoardSelect from 'modules/boards/containers/BoardSelect';
import { SelectContainer } from 'modules/boards/styles/common';
import { HeaderRow } from 'modules/boards/styles/item';
import React from 'react';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';
import {
  ControlLabel,
  FormControl,
  FormGroup
} from 'modules/common/components/form';

import { IAction } from 'modules/automations/types';
import Common from '../Common';
import { BoarHeader, Attributes } from 'modules/automations/styles';
import Icon from 'modules/common/components/Icon';
import { ATTRIBUTIONS } from '../constants';

type Props = {
  closeModal: () => void;
  activeAction: IAction;
  addAction: (
    action: IAction,
    contentId?: string,
    actionId?: string,
    config?: any
  ) => void;
};

type State = {
  config: any;
  attributions: any[];
};

class BoardItemForm extends React.Component<Props, State> {
  // private ref;
  private overlay: any;

  constructor(props) {
    super(props);

    // this.ref = React.createRef();
    const { config = {} } = this.props.activeAction;

    this.state = {
      config,
      attributions: []
    };
  }

  hideContent = () => {
    this.overlay.hide();
  };

  componentWillReceiveProps(nextProps) {
    if (nextProps.activeAction !== this.props.activeAction) {
      this.setState({ config: nextProps.activeAction.config });
    }
  }

  onChangeField = (name: string, value: string) => {
    const { config } = this.state;
    config[name] = value;

    this.setState({ config });
  };

  onClickAttribute = item => {
    this.overlay.hide();

    const attributions = [] as any;

    attributions.push(...this.state.attributions, item);

    this.setState({ attributions });
  };

  renderSelect() {
    const { activeAction } = this.props;

    let type = '';

    switch (activeAction.type) {
      case 'createDeal':
        type = 'deal';
        break;

      case 'createTask':
        type = 'task';
        break;

      case 'createTicket':
        type = 'ticket';
        break;
    }

    const { stageId, pipelineId, boardId } = this.state.config;

    const stgIdOnChange = stgId => this.onChangeField('stageId', stgId);
    const plIdOnChange = plId => this.onChangeField('pipelineId', plId);
    const brIdOnChange = brId => this.onChangeField('boardId', brId);

    return (
      <BoardSelect
        type={type}
        stageId={stageId || ''}
        pipelineId={pipelineId || ''}
        boardId={boardId || ''}
        onChangeStage={stgIdOnChange}
        onChangePipeline={plIdOnChange}
        onChangeBoard={brIdOnChange}
      />
    );
  }

  onChangeName = e => {
    const value = (e.target as HTMLInputElement).value;
    const { config } = this.state;
    config.cardName = value;

    this.setState({ config });
  };

  renderContent() {
    return (
      <Popover id="attribute-popover">
        <Attributes>
          {Object.keys(ATTRIBUTIONS).map((key, index) => {
            const title = key;
            const items = ATTRIBUTIONS[key];

            return (
              <React.Fragment key={index}>
                <b>{title}</b>
                {items.map(item => (
                  <li
                    key={item.value}
                    onClick={this.onClickAttribute.bind(this, item)}
                  >
                    {item.label}
                  </li>
                ))}
              </React.Fragment>
            );
          })}
        </Attributes>
      </Popover>
    );
  }

  renderValue() {
    const { attributions } = this.state;
    console.log(attributions);
    // return this.state.config.cardName;

    return attributions.map((attr, index) => (
      <React.Fragment key={index}>{attr.label}</React.Fragment>
    ));
  }

  renderName() {
    return (
      <SelectContainer>
        <HeaderRow>
          <BoarHeader>
            <FormGroup>
              <div className="header-row">
                <ControlLabel required={true}>Name</ControlLabel>
                <OverlayTrigger
                  ref={overlay => {
                    this.overlay = overlay;
                  }}
                  trigger="click"
                  placement="top"
                  overlay={this.renderContent()}
                  rootClose={true}
                  container={this}
                >
                  <span>
                    Attribution <Icon icon="angle-down" />
                  </span>
                </OverlayTrigger>
              </div>
              <FormControl
                name="name"
                value={this.renderValue()}
                onChange={this.onChangeName}
              />
            </FormGroup>
          </BoarHeader>
        </HeaderRow>
      </SelectContainer>
    );
  }

  render() {
    return (
      <Common config={this.state.config} {...this.props}>
        {this.renderSelect()}
        {this.renderName()}
      </Common>
    );
  }
}

export default BoardItemForm;
