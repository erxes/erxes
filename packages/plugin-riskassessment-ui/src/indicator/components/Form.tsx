import { gql } from '@apollo/client';
import {
  BarItems,
  Button,
  Form as CommonForm,
  ControlLabel,
  EmptyState,
  FormControl,
  FormGroup,
  PageHeader,
  Step,
  Steps,
  Tip,
  Toggle,
  __,
  confirm
} from '@erxes/ui/src';
import client from '@erxes/ui/src/apolloClient';
import {
  ControlWrapper,
  StepWrapper
} from '@erxes/ui/src/components/step/styles';
import {
  ColorPick,
  ColorPicker,
  FormColumn,
  FormWrapper
} from '@erxes/ui/src/styles/main';
import SelectBranches from '@erxes/ui/src/team/containers/SelectBranches';
import SelectDepartments from '@erxes/ui/src/team/containers/SelectDepartments';
import {
  IButtonMutateProps,
  IFormProps,
  IRouterProps
} from '@erxes/ui/src/types';
import { isEnabled } from '@erxes/ui/src/utils/core';
import React from 'react';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';
import TwitterPicker from 'react-color/lib/Twitter';
import Select from 'react-select-plus';
import { COLORS, calculateMethods } from '../../common/constants';
import { SelectOperations } from '../../common/utils';
import {
  CommonFormContainer,
  FormContainer,
  FormContent,
  Header
} from '../../styles';
import { RiskCalculateLogicType, RiskIndicatorsType } from '../common/types';
import { SelectTags } from '../common/utils';
import { mutations } from '../graphql';
import FormItem from './FormItem';

type Props = {
  detail?: RiskIndicatorsType;
  renderButton?: (props: IButtonMutateProps) => JSX.Element;
  duplicatIndicator: (_id: string) => void;
} & IRouterProps;

type IRiskIndicatorsStateType = {
  _id?: string;
  name?: string;
  description?: string;
  operationIds?: string[];
  departmentIds?: string[];
  branchIds?: string[];
  forms: any[];
  calculateMethod?: string;
  calculateLogics?: any[];
  createdAt?: string;
  isWithDescription?: boolean;
  tagIds: string;
};

type State = {
  riskIndicator: IRiskIndicatorsStateType;
};

class Form extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      riskIndicator: props.detail || {}
    };

    this.generateDoc = this.generateDoc.bind(this);
  }

  generateDoc(values) {
    const { riskIndicator } = this.state;
    let { calculateLogics, forms } = riskIndicator;

    delete values.logic;
    delete values.value;
    delete values.value2;

    forms = (forms || []).map(({ __typename, ...form }) => {
      return {
        ...form,
        calculateLogics: (form?.calculateLogics || []).map(
          ({ __typename, ...logic }) => logic
        )
      };
    });

    calculateLogics = (calculateLogics || []).map(
      ({ __typename, ...logic }) => logic
    );

    return { ...values, ...{ ...riskIndicator, forms, calculateLogics } };
  }
  handleClose = () => {
    const { riskIndicator } = this.state;
    const { detail, history } = this.props;
    const formIds: any[] = [];

    for (const form of riskIndicator.forms || []) {
      if (form.formId) {
        formIds.push(form.formId);
      }
    }

    const checkSaved = formIds.every(formId =>
      detail?.forms?.find(form => form.formId === formId)
    );

    if (!checkSaved) {
      confirm(
        `Are you sure you want to close.Your created form won't save`
      ).then(() => {
        client.mutate({
          mutation: gql(mutations.removeUnusedRiskIndicatorForm),
          variables: { formIds }
        });
        return history.push('/settings/risk-indicators');
      });
    }
    history.push('/settings/risk-indicators');
  };

  renderLogic(
    { _id, name, logic, value, value2, color }: RiskCalculateLogicType,
    formProps
  ) {
    const handleRow = e => {
      const { riskIndicator } = this.state;
      const { name, value } = e.currentTarget as HTMLInputElement;
      const { calculateLogics } = riskIndicator;
      const newVariables = (calculateLogics || []).map(logic =>
        logic._id === _id
          ? {
              ...logic,
              [name]: ['value', 'value2'].includes(name)
                ? parseInt(value)
                : value
            }
          : logic
      );
      this.setState(prev => ({
        riskIndicator: {
          ...prev.riskIndicator,
          calculateLogics: newVariables
        }
      }));
    };

    const removeLogicRow = e => {
      const { riskIndicator } = this.state;
      const removedLogicRows =
        riskIndicator.calculateLogics &&
        riskIndicator?.calculateLogics.filter(logic => logic._id !== _id);
      this.setState(prev => ({
        riskIndicator: {
          ...prev.riskIndicator,
          calculateLogics: removedLogicRows
        }
      }));
    };

    const onChangeColor = hex => {
      const { riskIndicator } = this.state;
      const newVariables =
        riskIndicator.calculateLogics &&
        riskIndicator.calculateLogics.map(logic =>
          logic._id === _id ? { ...logic, color: hex } : logic
        );
      this.setState(prev => ({
        riskIndicator: {
          ...prev.riskIndicator,
          calculateLogics: newVariables
        }
      }));
    };

    const renderColorSelect = selectedColor => {
      const popoverBottom = (
        <Popover id="color-picker">
          <TwitterPicker
            width="266px"
            triangle="hide"
            color={selectedColor}
            onChange={e => onChangeColor(e.hex)}
            colors={COLORS}
          />
        </Popover>
      );

      return (
        <OverlayTrigger
          trigger="click"
          rootClose={true}
          placement="bottom-start"
          overlay={popoverBottom}
        >
          <ColorPick>
            <ColorPicker style={{ backgroundColor: selectedColor }} />
          </ColorPick>
        </OverlayTrigger>
      );
    };

    return (
      <FormWrapper style={{ margin: '5px 0' }} key={_id}>
        <FormColumn>
          <FormControl
            name="name"
            type="text"
            value={name}
            onChange={handleRow}
            required
          />
        </FormColumn>
        <FormColumn>
          <FormControl
            name="logic"
            componentClass="select"
            required
            value={logic}
            onChange={handleRow}
          >
            <option />
            {['(>) greater than', '(<) lower than', '(≈) between'].map(
              value => (
                <option value={value} key={value}>
                  {value}
                </option>
              )
            )}
          </FormControl>
        </FormColumn>
        <FormColumn>
          <FormContainer row gap align="center">
            <FormControl
              name="value"
              type="number"
              value={value}
              onChange={handleRow}
              required
            />
            {logic === '(≈) between' && (
              <>
                <span>-</span>
                <FormControl
                  name="value2"
                  type="number"
                  value={value2}
                  onChange={handleRow}
                  required
                />
              </>
            )}
          </FormContainer>
        </FormColumn>
        <FormColumn>{renderColorSelect(color)}</FormColumn>
        <Tip text="Remove Row" placement="bottom">
          <Button
            btnStyle="danger"
            icon="times"
            onClick={removeLogicRow}
            style={{ marginLeft: '10px' }}
          />
        </Tip>
      </FormWrapper>
    );
  }

  renderLogics(formProps) {
    const { riskIndicator } = this.state;

    return (
      riskIndicator.calculateLogics &&
      riskIndicator.calculateLogics.map(logic =>
        this.renderLogic(logic, formProps)
      )
    );
  }

  renderGeneralFormsLogics(formProps) {
    const { riskIndicator } = this.state;

    if (!(riskIndicator?.forms?.length > 1)) {
      return null;
    }

    const handleChangeCalculateMethod = ({ value }) => {
      this.setState(prev => ({
        riskIndicator: { ...prev.riskIndicator, calculateMethod: value }
      }));
    };

    const handleAddLevel = e => {
      const variables = {
        _id: Math.random().toString(),
        name: '',
        value: 0,
        logic: ''
      };

      this.setState(prev => ({
        riskIndicator: {
          ...prev.riskIndicator,
          calculateLogics: [
            ...(prev.riskIndicator.calculateLogics || []),
            variables
          ]
        }
      }));
    };

    return (
      <FormContent>
        <FormWrapper>
          <FormColumn>
            <Header>{__('General Configuration of Forms')}</Header>
          </FormColumn>
        </FormWrapper>

        <FormGroup>
          <ControlLabel>{__('Calculate Methods')}</ControlLabel>
          <Select
            placeholder={__('Select Calculate Method')}
            value={riskIndicator?.calculateMethod}
            options={calculateMethods}
            multi={false}
            onChange={handleChangeCalculateMethod}
          />
        </FormGroup>
        <FormWrapper>
          {['Name', 'Logic', 'Value', 'Status Color'].map(head => (
            <FormColumn key={head}>
              <ControlLabel required>{head}</ControlLabel>
            </FormColumn>
          ))}
          <Tip text="Add Level" placement="bottom">
            <Button btnStyle="default" icon="add" onClick={handleAddLevel} />
          </Tip>
        </FormWrapper>
        {this.renderLogics(formProps)}
      </FormContent>
    );
  }

  renderForms() {
    const { riskIndicator } = this.state;

    if (!riskIndicator?.forms?.length) {
      return <EmptyState text="No Forms" icon="file-question" />;
    }

    const handleChange = doc => {
      const { riskIndicator } = this.state;

      const updatedForms = (riskIndicator?.forms || []).map(formData =>
        formData?._id === doc._id ? doc : formData
      );

      this.setState(prev => ({
        riskIndicator: { ...prev.riskIndicator, forms: updatedForms }
      }));
    };

    const removeRow = (id: string) => {
      const { riskIndicator } = this.state;

      riskIndicator.forms = riskIndicator.forms.filter(form => form._id !== id);

      this.setState({ riskIndicator });
    };

    return (riskIndicator?.forms || []).map(form => (
      <FormItem
        key={form._id}
        doc={form}
        handleChange={handleChange}
        remove={removeRow}
        totalFormsCount={riskIndicator?.forms.length}
        max={100}
      />
    ));
  }

  renderGeneralStep(formProps) {
    const { riskIndicator } = this.state;

    const handleState = e => {
      const { name, value } = e.currentTarget as HTMLInputElement;
      this.setState(prev => ({
        riskIndicator: { ...prev.riskIndicator, [name]: value }
      }));
    };

    const handleChangeSelection = (value, name) => {
      this.setState(prev => ({
        riskIndicator: { ...prev.riskIndicator, [name]: value }
      }));
    };

    return (
      <FormContainer column gap style={{ padding: 10 }}>
        <FormGroup>
          <ControlLabel required>{__('Name')}</ControlLabel>
          <FormControl
            {...formProps}
            key="name"
            name="name"
            type="text"
            required={true}
            value={riskIndicator.name}
            onChange={handleState}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>{__('Description')}</ControlLabel>
          <FormControl
            {...formProps}
            name="description"
            componentClass="textarea"
            value={riskIndicator.description}
            onChange={handleState}
          />
        </FormGroup>
        {isEnabled('tags') && (
          <FormGroup>
            <ControlLabel>{__('Tags')}</ControlLabel>
            <SelectTags
              name="tagIds"
              label="Choose Tags"
              initialValue={riskIndicator.tagIds}
              onSelect={handleChangeSelection}
              multi
            />
          </FormGroup>
        )}

        <FormContainer row flex gap>
          <FormGroup>
            <ControlLabel>{__('Branches')}</ControlLabel>
            <SelectBranches
              name="branchIds"
              label="Choose Branches"
              multi={true}
              initialValue={riskIndicator?.branchIds}
              onSelect={handleChangeSelection}
            />
          </FormGroup>
          <FormGroup>
            <ControlLabel>{__('Departments')}</ControlLabel>
            <SelectDepartments
              name="Departments"
              label="Choose Departments"
              multi={true}
              initialValue={riskIndicator?.departmentIds}
              onSelect={handleChangeSelection}
            />
          </FormGroup>
          <FormGroup>
            <ControlLabel>{__('Operations')}</ControlLabel>
            <SelectOperations
              name="operationIds"
              label="Choose Operations"
              multi={true}
              initialValue={riskIndicator?.operationIds}
              onSelect={handleChangeSelection}
            />
          </FormGroup>
        </FormContainer>
      </FormContainer>
    );
  }

  renderFormsStep(formProps) {
    const { riskIndicator } = this.state;

    const addForm = () => {
      this.setState(prev => ({
        riskIndicator: {
          ...prev.riskIndicator,
          forms: [
            ...(prev?.riskIndicator?.forms || []),
            { _id: String(Math.random()), formId: '', calculateMethod: '' }
          ]
        }
      }));
    };

    const toggleWithDescription = () => {
      this.setState(prev => ({
        ...prev,
        riskIndicator: {
          ...prev.riskIndicator,
          isWithDescription: !prev.riskIndicator?.isWithDescription
        }
      }));
    };

    return (
      <FormContainer column gap style={{ padding: 10 }}>
        {this.renderGeneralFormsLogics(formProps)}
        <FormWrapper>
          <FormContainer row gap align="center">
            <Toggle
              onChange={toggleWithDescription}
              checked={riskIndicator?.isWithDescription}
            />
            <ControlLabel>{__('use fields with description')}</ControlLabel>
          </FormContainer>
        </FormWrapper>
        {this.renderForms()}
        <div style={{ textAlign: 'center' }}>
          <Button icon="plus-1" onClick={addForm}>
            {__('Add Form')}
          </Button>
        </div>
      </FormContainer>
    );
  }

  renderContent = (formProps: IFormProps) => {
    return (
      <StepWrapper>
        {this.renderActions(formProps)}
        <Steps>
          <Step noButton img="/images/icons/erxes-07.svg" title="General">
            {this.renderGeneralStep(formProps)}
          </Step>
          <Step noButton img="/images/icons/erxes-30.png" title="Forms">
            {this.renderFormsStep(formProps)}
          </Step>
        </Steps>
      </StepWrapper>
    );
  };

  renderActions(formProps: IFormProps) {
    const { isSubmitted, values } = formProps;
    const { detail, renderButton, duplicatIndicator } = this.props;

    return (
      <ControlWrapper style={{ justifyContent: 'end' }}>
        {detail && (
          <Button
            btnStyle="warning"
            icon="file-copy-alt"
            onClick={duplicatIndicator.bind(this, detail._id)}
          >
            {__('Duplicate')}
          </Button>
        )}
        {renderButton &&
          renderButton({
            name: 'Indicator',
            values: this.generateDoc(values),
            isSubmitted,
            object: detail
          })}
      </ControlWrapper>
    );
  }

  render() {
    return (
      <CommonFormContainer>
        <PageHeader>
          <BarItems>
            <Button
              icon="leftarrow-3"
              btnStyle="link"
              onClick={this.handleClose}
            >
              {__('Back')}
            </Button>
          </BarItems>
        </PageHeader>
        <CommonForm {...this.props} renderContent={this.renderContent} />
      </CommonFormContainer>
    );
  }
}

export default Form;
