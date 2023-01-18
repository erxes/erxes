import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';
import React from 'react';
import SelectProductCategory from '@erxes/ui-products/src/containers/SelectProductCategory';
import TwitterPicker from 'react-color/lib/Twitter';
import { __ } from '@erxes/ui/src/utils';
import {
  Button,
  ControlLabel,
  Form as CommonForm,
  FormControl,
  FormGroup
} from '@erxes/ui/src/components';
import {
  ColorPick,
  ColorPicker,
  FormColumn,
  FormWrapper
} from '@erxes/ui/src/styles/main';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import { ILabelRule, ISPLabel } from '../types';
import {
  MainStyleModalFooter as ModalFooter,
  MainStyleScrollWrapper as ScrollWrapper
} from '@erxes/ui/src/styles/eindex';

type Props = {
  spLabel?: ISPLabel;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  closeModal: () => void;
};

type State = {
  spLabel: ISPLabel;
};

class Form extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      spLabel: this.props.spLabel || {}
    };
  }

  generateDoc = (values: { _id?: string }) => {
    const finalValues = values;
    const { spLabel } = this.state;

    if (spLabel._id) {
      finalValues._id = spLabel._id;
    }

    return {
      ...finalValues,
      ...spLabel
    };
  };

  onChangeDescription = e => {
    this.setState({
      spLabel: {
        ...this.state.spLabel,
        description: e.editor.getData()
      }
    });
  };

  onInputChange = e => {
    e.preventDefault();
    const value = e.target.value;
    const name = e.target.name;

    this.setState({
      spLabel: { ...this.state.spLabel, [name]: value }
    });
  };

  onAddRule = () => {
    const { spLabel } = this.state;
    const { rules = [] } = spLabel;

    rules.push({
      id: Math.random().toString(),
      productCategoryId: '',
      multiplier: 1
    });
    spLabel.rules = rules;
    this.setState({ spLabel });
  };

  onRemoveRule = ruleId => {
    const { spLabel } = this.state;
    const { rules = [] } = spLabel;
    spLabel.rules = rules.filter(a => a.id !== ruleId);
    this.setState({ spLabel });
  };

  renderRule = (rule: ILabelRule, formProps) => {
    const changeRule = (key, value) => {
      const { spLabel } = this.state;
      rule[key] = value;
      spLabel.rules = (spLabel.rules || []).map(
        a => (a.id === rule.id && rule) || a
      );
      this.setState({ spLabel });
    };

    const onChangeMultiplier = e => {
      e.preventDefault();
      const value = e.target.value;
      changeRule('multiplier', Number(value));
    };

    const onChangeProductCategory = categoryId => {
      changeRule('productCategoryId', categoryId);
    };

    return (
      <FormWrapper key={rule.id}>
        <FormColumn>
          <SelectProductCategory
            label="Choose product category"
            name="productCategoryId"
            initialValue={rule.productCategoryId || ''}
            onSelect={onChangeProductCategory}
            multi={false}
          />
        </FormColumn>

        <FormColumn>
          <FormControl
            {...formProps}
            name="multiplier"
            type="number"
            min={0}
            defaultValue={rule.multiplier || 1}
            required={true}
            onChange={onChangeMultiplier}
          />
        </FormColumn>
        <Button
          btnStyle="simple"
          size="small"
          onClick={this.onRemoveRule.bind(this, rule.id)}
          icon="times"
        >
          Remove lvl
        </Button>
      </FormWrapper>
    );
  };

  renderRules = formProps => {
    return (this.state.spLabel.rules || []).map(rule =>
      this.renderRule(rule, formProps)
    );
  };

  renderContent = (formProps: IFormProps) => {
    const { renderButton, closeModal } = this.props;
    const { values, isSubmitted } = formProps;

    const { spLabel } = this.state;
    const onChangeColor = e => {
      spLabel.color = e.hex;
      this.setState({ spLabel });
    };

    const popoverContent = (
      <Popover id={Math.random()}>
        <TwitterPicker
          color={{ hex: spLabel.color }}
          onChange={onChangeColor}
          triangle="hide"
        />
      </Popover>
    );

    return (
      <>
        <ScrollWrapper>
          <FormWrapper>
            <FormColumn>
              <FormGroup>
                <ControlLabel required={true}>{__(`Title`)}</ControlLabel>
                <FormControl
                  {...formProps}
                  name="title"
                  defaultValue={spLabel.title}
                  autoFocus={true}
                  required={true}
                  onChange={this.onInputChange}
                />
              </FormGroup>
            </FormColumn>
            <FormColumn>
              <FormGroup>
                <ControlLabel required={true}>{__(`Effect`)}</ControlLabel>
                <FormControl
                  {...formProps}
                  name="effect"
                  defaultValue={spLabel.effect}
                  required={true}
                  onChange={this.onInputChange}
                />
              </FormGroup>
            </FormColumn>
          </FormWrapper>

          <FormWrapper>
            <FormColumn>
              <FormGroup>
                <ControlLabel>{__('Color')}</ControlLabel>
                <div>
                  <OverlayTrigger
                    trigger="click"
                    rootClose={true}
                    placement="bottom-start"
                    overlay={popoverContent}
                  >
                    <ColorPick>
                      <ColorPicker style={{ backgroundColor: spLabel.color }} />
                    </ColorPick>
                  </OverlayTrigger>
                </div>
                <ControlLabel>Status</ControlLabel>
                <FormControl
                  name="status"
                  componentClass="select"
                  defaultValue={spLabel.status}
                  required={false}
                  onChange={this.onInputChange}
                >
                  <option key={'active'} value={'active'}>
                    {' '}
                    {'active'}{' '}
                  </option>
                  <option key={'archived'} value={'archived'}>
                    {' '}
                    {'archived'}{' '}
                  </option>
                </FormControl>
              </FormGroup>
            </FormColumn>
            <FormColumn>
              <FormGroup>
                <ControlLabel>Description</ControlLabel>
                <FormControl
                  {...formProps}
                  componentClass="textarea"
                  name="description"
                  defaultValue={spLabel.description}
                  onChange={this.onInputChange}
                />
              </FormGroup>
            </FormColumn>
          </FormWrapper>

          <FormWrapper>
            <FormColumn>
              <ControlLabel required={true}>
                {__('Product Category')}
              </ControlLabel>
            </FormColumn>
            <FormColumn>
              <ControlLabel required={true}>{__('Multiplier')}</ControlLabel>
            </FormColumn>
            <Button btnStyle="simple" icon="add" onClick={this.onAddRule}>
              {__('Add level')}
            </Button>
          </FormWrapper>

          {this.renderRules(formProps)}
        </ScrollWrapper>
        <ModalFooter>
          <Button
            btnStyle="simple"
            onClick={closeModal}
            icon="times-circle"
            uppercase={false}
          >
            Close
          </Button>

          {renderButton({
            values: this.generateDoc(values),
            isSubmitted,
            callback: closeModal,
            object: spLabel
          })}
        </ModalFooter>
      </>
    );
  };

  render() {
    return <CommonForm renderContent={this.renderContent} />;
  }
}

export default Form;
