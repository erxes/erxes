import CommonForm from '@erxes/ui-settings/src/common/components/Form';
import { ICommonFormProps } from '@erxes/ui-settings/src/common/types';
import {
  Button,
  confirm,
  EmptyState,
  FormGroup,
  Icon,
  Spinner,
  Tip,
  Toggle,
  __
} from '@erxes/ui/src';
import client from '@erxes/ui/src/apolloClient';
import FormControl from '@erxes/ui/src/components/form/Control';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import {
  ColorPick,
  ColorPicker,
  FormColumn,
  FormWrapper,
  LinkButton
} from '@erxes/ui/src/styles/main';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import React from 'react';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';
import TwitterPicker from 'react-color/lib/Twitter';
import Select from 'react-select-plus';
import { calculateMethods, COLORS } from '../../common/constants';
import { RiskIndicatorsType, RiskCalculateLogicType } from '../common/types';
import { SelectOperation, SelectWithCategory } from '../../common/utils';
import { mutations } from '../graphql';
import { FormContainer, FormContent, Header } from '../../styles';
import FormItem from './FormItem';
import gql from 'graphql-tag';
import SelectBranches from '@erxes/ui/src/team/containers/SelectBranches';
import SelectDepartments from '@erxes/ui/src/team/containers/SelectDepartments';

type Props = {
  indicatorDetail?: RiskIndicatorsType;
  detailLoading?: boolean;
  renderButton?: (props: IButtonMutateProps) => JSX.Element;
  categoryIds?: string;
  fieldsSkip?: any;
} & ICommonFormProps;

type IRiskIndicatorsStateType = {
  _id?: string;
  name?: string;
  description?: string;
  categoryId?: string;
  operationIds?: string[];
  departmentIds?: string[];
  branchIds?: string[];
  forms: any[];
  calculateMethod?: string;
  calculateLogics?: RiskCalculateLogicType[];
  createdAt?: string;
  category?: any;
  customScoreField?: any;
};

type State = {
  riskIndicator: IRiskIndicatorsStateType;
  withCustomScore: boolean;
};

class Form extends React.Component<Props & ICommonFormProps, State> {
  constructor(props) {
    super(props);

    this.state = {
      riskIndicator: props.indicatorDetail || {
        categoryId: props.categoryId || ''
      },
      withCustomScore: props.indicatorDetail?.customScoreField ? true : false
    };

    this.generateDoc = this.generateDoc.bind(this);
  }

  generateDoc(values) {
    const { riskIndicator } = this.state;

    delete values.logic;
    delete values.value;
    delete values.value2;

    delete riskIndicator?.customScoreField?.__typename;

    (riskIndicator.forms || []).forEach(formData => {
      delete formData.__typename;
      (formData.calculateLogics || []).forEach(
        logic => delete logic.__typename
      );
    });

    (riskIndicator?.calculateLogics || []).forEach(logic => {
      delete logic.__typename;
    });

    return { ...values, ...riskIndicator };
  }

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
            {...formProps}
            name="name"
            type="text"
            defaultValue={name}
            onChange={handleRow}
            required
          />
        </FormColumn>
        <FormColumn>
          <FormControl
            name="logic"
            {...formProps}
            componentClass="select"
            required
            defaultValue={logic}
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
              {...formProps}
              name="value"
              type="number"
              defaultValue={value}
              onChange={handleRow}
              required
            />
            {logic === '(≈) between' && (
              <>
                <span>-</span>
                <FormControl
                  {...formProps}
                  name="value2"
                  type="number"
                  defaultValue={value2}
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

  renderGeneralLogics(formProps) {
    const { riskIndicator, withCustomScore } = this.state;
    const { customScoreField } = riskIndicator;

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

    const toggleCustomScoreField = () => {
      this.setState(({ withCustomScore }) => ({
        withCustomScore: !withCustomScore
      }));
    };

    const handleCustomScoreField = e => {
      const { name, value } = e.currentTarget as HTMLInputElement;

      this.setState(({ riskIndicator }) => ({
        riskIndicator: {
          ...riskIndicator,
          customScoreField: {
            ...riskIndicator.customScoreField,
            [name]: name === 'percentWeight' ? Number(value) : value
          }
        }
      }));
    };

    return (
      <FormContent>
        <FormWrapper>
          <FormColumn>
            <Header>{__('General Configuration of Forms')}</Header>
          </FormColumn>
          <FormContainer row gap align="center">
            <ControlLabel>{__('indicator with custom score')}</ControlLabel>
            <Toggle
              checked={withCustomScore}
              onChange={toggleCustomScoreField}
            />
          </FormContainer>
        </FormWrapper>
        {withCustomScore && (
          <FormGroup>
            <ControlLabel>{__('Custom score field')}</ControlLabel>
            <FormWrapper>
              <FormColumn>
                <FormGroup>
                  <FormControl
                    type="text"
                    name="label"
                    placeholder="Label"
                    value={customScoreField?.label}
                    onChange={handleCustomScoreField}
                  />
                </FormGroup>
              </FormColumn>
              <FormGroup>
                <FormControl
                  type="number"
                  name="percentWeight"
                  placeholder="Percent weight"
                  value={customScoreField?.percentWeight}
                  onChange={handleCustomScoreField}
                />
              </FormGroup>
            </FormWrapper>
          </FormGroup>
        )}
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
        key={form.id}
        doc={form}
        handleChange={handleChange}
        remove={removeRow}
        totalFormsCount={riskIndicator?.forms.length}
        max={100}
      />
    ));
  }

  renderContent = (formProps: IFormProps) => {
    const { detailLoading } = this.props;
    const { riskIndicator } = this.state;

    if (detailLoading) {
      return <Spinner objective />;
    }
    const handleState = e => {
      const { name, value } = e.currentTarget as HTMLInputElement;
      this.setState(prev => ({
        riskIndicator: { ...prev.riskIndicator, [name]: value }
      }));
    };

    const handleChangeSelection = (name, value) => {
      this.setState(prev => ({
        riskIndicator: { ...prev.riskIndicator, [name]: value }
      }));
    };

    const addForm = () => {
      this.setState(prev => ({
        riskIndicator: {
          ...prev.riskIndicator,
          forms: [
            ...(prev?.riskIndicator?.forms || []),
            { _id: String(Math.random()) }
          ]
        }
      }));
    };
    return (
      <>
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
        <FormGroup>
          <ControlLabel>{__('Category')}</ControlLabel>
          <SelectWithCategory
            name="categoryId"
            label="Choose Category"
            multi={false}
            initialValue={riskIndicator?.categoryId}
            onSelect={value => handleChangeSelection('categoryId', value)}
          />
        </FormGroup>
        <FormContainer row flex gap>
          <FormGroup>
            <ControlLabel>{__('Branches')}</ControlLabel>
            <SelectBranches
              name="branchIds"
              label="Choose Branches"
              multi={true}
              initialValue={riskIndicator?.branchIds}
              onSelect={value => handleChangeSelection('branchIds', value)}
            />
          </FormGroup>
          <FormGroup>
            <ControlLabel>{__('Departments')}</ControlLabel>
            <SelectDepartments
              name="Departments"
              label="Choose Departments"
              multi={true}
              initialValue={riskIndicator?.departmentIds}
              onSelect={value => handleChangeSelection('departmentIds', value)}
            />
          </FormGroup>
          <FormGroup>
            <ControlLabel>{__('Operations')}</ControlLabel>
            <SelectOperation
              name="operationIds"
              label="Choose Operations"
              multi={true}
              initialValue={riskIndicator?.operationIds}
              onSelect={value => handleChangeSelection('operationIds', value)}
            />
          </FormGroup>
        </FormContainer>

        <FormContainer column gap style={{ padding: 10 }}>
          {this.renderGeneralLogics(formProps)}
          <FormWrapper>
            <FormColumn>
              <Header>{__('Forms')}</Header>
            </FormColumn>
          </FormWrapper>
          {this.renderForms()}
          <div style={{ textAlign: 'center' }}>
            <Button icon="plus-1" onClick={addForm}>
              {__('Add Form')}
            </Button>
          </div>
        </FormContainer>
      </>
    );
  };

  render() {
    const { indicatorDetail, renderButton, closeModal } = this.props;
    const { riskIndicator } = this.state;

    const handleClose = () => {
      const formIds: any[] = [];

      for (const form of riskIndicator.forms || []) {
        if (form.formId) {
          formIds.push(form.formId);
        }
      }

      const checkSaved = formIds.every(formId =>
        indicatorDetail?.forms?.find(form => form.formId === formId)
      );

      if (!checkSaved) {
        confirm(
          `Are you sure you want to close.Your created form won't save`
        ).then(() => {
          client.mutate({
            mutation: gql(mutations.removeUnusedRiskIndicatorForm),
            variables: { formIds }
          });
          return closeModal();
        });
      }
      closeModal();
    };

    return (
      <CommonForm
        {...this.props}
        closeModal={handleClose}
        renderContent={this.renderContent}
        generateDoc={this.generateDoc}
        object={this.props.object}
        renderButton={renderButton}
        createdAt={indicatorDetail?.createdAt}
      />
    );
  }
}

export default Form;
