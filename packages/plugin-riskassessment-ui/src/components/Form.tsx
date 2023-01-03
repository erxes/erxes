import CommonForm from '@erxes/ui-settings/src/common/components/Form';
import { ICommonFormProps } from '@erxes/ui-settings/src/common/types';
import {
  Button,
  confirm,
  EmptyState,
  FormGroup,
  Spinner,
  Tip,
  __
} from '@erxes/ui/src';
import client from '@erxes/ui/src/apolloClient';
import FormControl from '@erxes/ui/src/components/form/Control';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import {
  ColorPick,
  ColorPicker,
  FormColumn,
  FormWrapper
} from '@erxes/ui/src/styles/main';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import React from 'react';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';
import TwitterPicker from 'react-color/lib/Twitter';
import Select from 'react-select-plus';
import { calculateMethods, COLORS } from '../common/constants';
import { RiskAssessmentsType, RiskCalculateLogicType } from '../common/types';
import { SelectWithCategory } from '../common/utils';
import { mutations } from '../graphql';
import { FormContainer, FormContent, Header } from '../styles';
import FormItem from './FormItem';
import gql from 'graphql-tag';
import SelectBranches from '@erxes/ui/src/team/containers/SelectBranches';
import SelectDepartments from '@erxes/ui/src/team/containers/SelectDepartments';

type Props = {
  assessmentDetail?: RiskAssessmentsType;
  detailLoading?: boolean;
  renderButton?: (props: IButtonMutateProps) => JSX.Element;
  categoryIds?: string;
  fieldsSkip?: any;
} & ICommonFormProps;

type State = {
  riskAssessment: {
    _id?: string;
    name?: string;
    description?: string;
    categoryIds?: string[];
    departmentIds?: string[];
    branchIds?: string[];
    forms: any[];
    calculateMethod?: string;
    calculateLogics?: RiskCalculateLogicType[];
    createdAt?: string;
    category?: any;
  };
};

class Form extends React.Component<Props & ICommonFormProps, State> {
  constructor(props) {
    super(props);

    this.state = {
      riskAssessment: props.assessmentDetail || {
        categoryIds: props.categoryIds || ''
      }
    };

    this.generateDoc = this.generateDoc.bind(this);
  }

  generateDoc(values) {
    const { riskAssessment } = this.state;
    const { assessmentDetail, fieldsSkip } = this.props;
    if (assessmentDetail) {
      delete values.logic;
      delete values.value;
      delete values.value2;
      riskAssessment.forms?.forEach(formData => {
        delete formData.__typename;
        formData.calculateLogics.forEach(logic => delete logic.__typename);
      });

      const {
        _id,
        name,
        description,
        categoryIds,
        branchIds,
        departmentIds,
        forms,
        calculateLogics,
        calculateMethod
      } = riskAssessment;
      // if (fieldsSkip) {
      //   return {
      //     ...values,
      //     calculateMethod: riskAssessment.calculateMethod,
      //     categoryIds: riskAssessment.categoryIds,
      //     calculateLogics: riskAssessment.calculateLogics
      //   };
      // }
      calculateLogics?.forEach(logic => {
        delete logic.__typename;
      });
      return {
        // id: assessmentDetail._id,
        doc: {
          ...values,
          _id,
          name,
          description,
          categoryIds,
          departmentIds,
          branchIds,
          forms,
          calculateLogics,
          calculateMethod
        }
      };
    }
    return { ...values, ...riskAssessment };
  }

  renderLogic(
    { _id, name, logic, value, value2, color }: RiskCalculateLogicType,
    formProps
  ) {
    const handleRow = e => {
      const { riskAssessment } = this.state;
      const { name, value } = e.currentTarget as HTMLInputElement;
      const { calculateLogics } = riskAssessment;
      const newVariables =
        // riskAssessment.calculateLogics &&
        (calculateLogics || []).map(logic =>
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
        riskAssessment: {
          ...prev.riskAssessment,
          calculateLogics: newVariables
        }
      }));
    };

    const removeLogicRow = e => {
      const { riskAssessment } = this.state;
      const removedLogicRows =
        riskAssessment.calculateLogics &&
        riskAssessment?.calculateLogics.filter(logic => logic._id !== _id);
      this.setState(prev => ({
        riskAssessment: {
          ...prev.riskAssessment,
          calculateLogics: removedLogicRows
        }
      }));
    };

    const onChangeColor = hex => {
      const { riskAssessment } = this.state;
      const newVariables =
        riskAssessment.calculateLogics &&
        riskAssessment.calculateLogics.map(logic =>
          logic._id === _id ? { ...logic, color: hex } : logic
        );
      this.setState(prev => ({
        riskAssessment: {
          ...prev.riskAssessment,
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
    const { riskAssessment } = this.state;

    return (
      riskAssessment.calculateLogics &&
      riskAssessment.calculateLogics.map(logic =>
        this.renderLogic(logic, formProps)
      )
    );
  }

  renderGeneralLogics(formProps) {
    const { riskAssessment } = this.state;

    const handleChangeCalculateMethod = ({ value }) => {
      this.setState(prev => ({
        riskAssessment: { ...prev.riskAssessment, calculateMethod: value }
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
        riskAssessment: {
          ...prev.riskAssessment,
          calculateLogics: [
            ...(prev.riskAssessment.calculateLogics || []),
            variables
          ]
        }
      }));
    };
    return (
      <FormContent>
        <Header>{__('General Configuration of Forms')}</Header>
        <FormGroup>
          <ControlLabel>{__('Calculate Methods')}</ControlLabel>
          <Select
            placeholder={__('Select Calculate Method')}
            value={riskAssessment?.calculateMethod}
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
    const { riskAssessment } = this.state;
    const handleChangeFormData = doc => {
      const { riskAssessment } = this.state;

      const updatedForms = (riskAssessment?.forms || []).map(formData =>
        formData?._id === doc._id ? doc : formData
      );

      this.setState(prev => ({
        riskAssessment: { ...prev.riskAssessment, forms: updatedForms }
      }));
    };

    return (riskAssessment?.forms || []).map(form => (
      <>
        <FormItem
          key={form.id}
          doc={form}
          handleChange={handleChangeFormData}
          totalFormsCount={riskAssessment?.forms.length}
          max={100}
        />
      </>
    ));
  }

  renderContent = (formProps: IFormProps) => {
    const { detailLoading } = this.props;
    const { riskAssessment } = this.state;

    if (detailLoading) {
      return <Spinner objective />;
    }
    const handleState = e => {
      const { name, value } = e.currentTarget as HTMLInputElement;
      this.setState(prev => ({
        riskAssessment: { ...prev.riskAssessment, [name]: value }
      }));
    };

    const handleChangeSelection = (name, value) => {
      this.setState(prev => ({
        riskAssessment: { ...prev.riskAssessment, [name]: value }
      }));
    };

    const addForm = () => {
      this.setState(prev => ({
        riskAssessment: {
          forms: [
            ...(prev?.riskAssessment?.forms || []),
            { _id: String(Math.random()) }
          ]
        }
      }));
    };

    const getMaxValuePercentWeight = () => {
      const { riskAssessment } = this.state;

      const { forms } = riskAssessment;

      const percentWeights = forms
        .map(form => form.percentWeight)
        .filter(item => item);
      if (percentWeights.length === 1) {
        return 100 - percentWeights[0];
      }
      if (percentWeights.length > 1) {
        const total = percentWeights.reduce((prev, curr) => prev + curr);
        if (100 - total < 0) {
          return 0;
        }
        return 100 - total;
      }
      return 100;
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
            value={riskAssessment.name}
            onChange={handleState}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>{__('Description')}</ControlLabel>
          <FormControl
            {...formProps}
            name="description"
            componentClass="textarea"
            value={riskAssessment.description}
            onChange={handleState}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>{__('Branches')}</ControlLabel>
          <SelectBranches
            name="branchIds"
            label="Choose Branches"
            multi={true}
            initialValue={riskAssessment?.branchIds}
            onSelect={value => handleChangeSelection('branchIds', value)}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>{__('Departments')}</ControlLabel>
          <SelectDepartments
            name="Departments"
            label="Choose Departments"
            multi={true}
            initialValue={riskAssessment?.departmentIds}
            onSelect={value => handleChangeSelection('departmentIds', value)}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>{__('Categories')}</ControlLabel>
          <SelectWithCategory
            name="categoryIds"
            label="Choose Category"
            multi={true}
            initialValue={riskAssessment?.categoryIds}
            onSelect={value => handleChangeSelection('categoryIds', value)}
          />
        </FormGroup>
        <FormContainer column gap style={{ padding: 10 }}>
          {riskAssessment?.forms?.length > 1 &&
            this.renderGeneralLogics(formProps)}
          <FormWrapper>
            <FormColumn>
              <Header>{__('Forms')}</Header>
            </FormColumn>
            <Button icon="plus-1" onClick={addForm}>
              {__('Add Form')}
            </Button>
          </FormWrapper>
          {!!riskAssessment?.forms?.length ? (
            this.renderForms()
          ) : (
            <EmptyState text="No Forms" icon="file-question" />
          )}
        </FormContainer>
      </>
    );
  };

  render() {
    const { assessmentDetail, renderButton, closeModal } = this.props;
    const { riskAssessment } = this.state;

    const handleClose = () => {
      const formIds: any[] = [];

      for (const form of riskAssessment.forms || []) {
        if (form.formId) {
          formIds.push(form.formId);
        }
      }

      if (!!formIds.length) {
        confirm(
          `Are you sure you want to close.Your created form won't save`
        ).then(() => {
          client.mutate({
            mutation: gql(mutations.removeUnusedRiskAssessmentForm),
            variables: { formIds }
          });
          return closeModal();
        });
      }
    };

    return (
      <CommonForm
        {...this.props}
        closeModal={handleClose}
        renderContent={this.renderContent}
        generateDoc={this.generateDoc}
        object={this.props.object}
        renderButton={renderButton}
        createdAt={assessmentDetail?.createdAt}
      />
    );
  }
}

export default Form;
