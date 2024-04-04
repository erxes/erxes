import { Row } from '@erxes/ui-inbox/src/settings/integrations/styles';
import Button from '@erxes/ui/src/components/Button';
import CollapseContent from '@erxes/ui/src/components/CollapseContent';
import FormControl from '@erxes/ui/src/components/form/Control';
import Form from '@erxes/ui/src/components/form/Form';
import FormGroup from '@erxes/ui/src/components/form/Group';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import Toggle from '@erxes/ui/src/components/Toggle';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import {
  IButtonMutateProps,
  IFieldLogic,
  IFormProps
} from '@erxes/ui/src/types';
import { __ } from '@erxes/ui/src/utils';
import { RenderDynamicComponent } from '@erxes/ui/src/utils/core';
import React from 'react';

import PropertyLogics from '../containers/PropertyLogics';
import { IFieldGroup } from '../types';

type Props = {
  group?: IFieldGroup;
  groups: IFieldGroup[];
  type: string;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  closeModal: () => void;
};

type State = {
  isMultiple: boolean;
  isVisible: boolean;
  isVisibleInDetail: boolean;
  alwaysOpen: boolean;
  config: any;
  logics?: IFieldLogic[];
  logicAction?: string;
};
class PropertyGroupForm extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    let isMultiple = false;
    let isVisible = true;
    let isVisibleInDetail = true;
    let alwaysOpen = false;
    let config = {};

    if (props.group) {
      isMultiple = props.group.isMultiple;
      isVisible = props.group.isVisible;
      isVisibleInDetail = props.group.isVisibleInDetail;
      config = props.group.config;
      alwaysOpen = props.group.alwaysOpen;
    }

    this.state = {
      config,
      isMultiple,
      isVisible,
      isVisibleInDetail,
      alwaysOpen,
      logics: props.group && props.group.logics ? props.group.logics : [],
      logicAction: props.group && props.group.logicAction
    };
  }

  generateDoc = (values: {
    _id?: string;
    name: string;
    description: string;
    logicAction: string;
    logics: IFieldLogic[];
  }) => {
    const { group, type } = this.props;
    const finalValues = values;
    const config = this.state.config;

    const { logicAction, logics } = this.state;

    if (group) {
      finalValues._id = group._id;
    }

    return {
      ...finalValues,
      contentType: type,
      isMultiple: this.state.isMultiple,
      isVisible: this.state.isVisible,
      isVisibleInDetail: this.state.isVisibleInDetail,
      alwaysOpen: this.state.alwaysOpen,
      config,
      logicAction,
      logics
    };
  };

  multipleHandler = e => {
    if (e.target.id === 'multiple') {
      const isMultiple = e.target.checked;

      return this.setState({ isMultiple });
    }
  };

  alwaysOpenHandler = e => {
    if (e.target.id === 'alwaysOpen') {
      const alwaysOpen = e.target.checked;

      return this.setState({ alwaysOpen });
    }
  };

  visibleHandler = e => {
    if (e.target.id === 'visible') {
      const isVisible = e.target.checked;

      return this.setState({ isVisible });
    }

    const isVisibleInDetail = e.target.checked;

    return this.setState({ isVisibleInDetail });
  };

  renderFieldVisible() {
    if (!this.props.group) {
      return null;
    }

    const Checked = () => <span>And</span>;
    const UnChecked = () => <span>Or</span>;

    return (
      <FormGroup>
        <ControlLabel>Visible</ControlLabel>
        <div>
          <Toggle
            id="visible"
            checked={this.state.isVisible}
            onChange={this.visibleHandler}
            icons={{ checked: <Checked />, unchecked: <UnChecked /> }}
          />
        </div>
      </FormGroup>
    );
  }

  renderFieldVisibleInDetail() {
    if (!this.props.group) {
      return null;
    }

    return (
      <FormGroup>
        <ControlLabel>Visible in detail</ControlLabel>
        <div>
          <Toggle
            id="visibleDetail"
            checked={this.state.isVisibleInDetail}
            onChange={this.visibleHandler}
            icons={{
              checked: <span>Yes</span>,
              unchecked: <span>No</span>
            }}
          />
        </div>
      </FormGroup>
    );
  }

  onChangeItems = (boardsPipelines: any, key?: string) => {
    if (key) {
      this.setState({ config: { [key]: boardsPipelines } });
      return;
    }

    this.setState({ config: { boardsPipelines } });
  };

  onChangeLogicAction = value => {
    this.setState({ logicAction: value });
  };

  onChangeLogics = logics => {
    this.setState({ logics });
  };

  renderExtraContent() {
    const { type } = this.props;
    const { config } = this.state;

    const plugins: any[] = (window as any).plugins || [];

    for (const plugin of plugins) {
      if (type.includes(`${plugin.name}:`) && plugin.propertyGroupForm) {
        return (
          <RenderDynamicComponent
            scope={plugin.scope}
            component={plugin.propertyGroupForm}
            injectedProps={{
              config,
              type,
              onChangeItems: this.onChangeItems
            }}
          />
        );
      }
    }

    return null;
  }

  renderContent = (formProps: IFormProps) => {
    const { group, groups, closeModal, renderButton } = this.props;
    const { values, isSubmitted } = formProps;

    const object = group || ({} as IFieldGroup);

    return (
      <>
        <FormGroup>
          <ControlLabel required={true}>Name</ControlLabel>
          <FormControl
            {...formProps}
            name="name"
            autoFocus={true}
            required={true}
            defaultValue={object.name}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel required={true}>Description</ControlLabel>
          <FormControl
            {...formProps}
            name="description"
            required={true}
            defaultValue={object.description}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Code</ControlLabel>
          <FormControl {...formProps} name="code" defaultValue={object.code} />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Parent group:</ControlLabel>
          <Row>
            <FormControl
              {...formProps}
              name="parentId"
              componentClass="select"
              defaultValue={object.parentId || null}
            >
              <option value="" />
              {groups
                .filter(e => !e.isDefinedByErxes)
                .map(g => {
                  return (
                    <option key={g._id} value={g._id}>
                      {g.name}
                    </option>
                  );
                })}
            </FormControl>
          </Row>
        </FormGroup>

        {this.renderFieldVisible()}
        {this.renderExtraContent()}

        {['visitor', 'lead', 'customer'].includes(object.contentType) ? (
          this.renderFieldVisibleInDetail()
        ) : (
          <></>
        )}

        <FormGroup>
          <ControlLabel>{__('Always open')} </ControlLabel>
          <p>{__('Whether this group is always open in a sidebar')}</p>
          <div>
            <Toggle
              id="alwaysOpen"
              checked={this.state.alwaysOpen}
              onChange={this.alwaysOpenHandler}
              icons={{
                checked: <span>Checked</span>,
                unchecked: <span>Unchecked</span>
              }}
            />
          </div>
        </FormGroup>

        <FormGroup>
          <ControlLabel>Multiple</ControlLabel>
          <div>
            <Toggle
              id="multiple"
              checked={this.state.isMultiple}
              onChange={this.multipleHandler}
              icons={{
                checked: <span>Checked</span>,
                unchecked: <span>Unchecked</span>
              }}
            />
          </div>
        </FormGroup>

        <CollapseContent title={__('Logic')} compact={true}>
          <PropertyLogics
            contentType={this.props.type}
            logics={this.state.logics || []}
            action={this.state.logicAction || 'show'}
            onLogicsChange={this.onChangeLogics}
            onActionChange={this.onChangeLogicAction}
          />
        </CollapseContent>

        <ModalFooter>
          <Button btnStyle="simple" onClick={closeModal} icon="times-circle">
            Close
          </Button>

          {renderButton({
            name: 'property group',
            values: this.generateDoc(values),
            isSubmitted,
            callback: closeModal,
            object: group
          })}
        </ModalFooter>
      </>
    );
  };

  render() {
    return <Form renderContent={this.renderContent} />;
  }
}

export default PropertyGroupForm;
