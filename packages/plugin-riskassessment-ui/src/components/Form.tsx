import CommonForm from '@erxes/ui-settings/src/common/components/Form';
import { ICommonFormProps } from '@erxes/ui-settings/src/common/types';
import { Button, Spinner, Tip } from '@erxes/ui/src';
import FormControl from '@erxes/ui/src/components/form/Control';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import { ColorPick, ColorPicker, FormColumn, FormWrapper } from '@erxes/ui/src/styles/main';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import React from 'react';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';
import TwitterPicker from 'react-color/lib/Twitter';
import { COLORS } from '../common/constants';
import {
  RiskAssessmentsType,
  RiskAssessmentCategory,
  RiskCalculateLogicType
} from '../common/types';
import { subOption } from '../common/utils';
import { FormContainer, FormGroupRow } from '../styles';

type Props = {
  categories: RiskAssessmentCategory[];
  loading: boolean;
  assessmentDetail?: RiskAssessmentsType;
  detailLoading?: boolean;
  renderButton?: (props: IButtonMutateProps) => JSX.Element;
  categoryId?: String;
} & ICommonFormProps;

type CustomFromGroupProps = {
  children?: React.ReactChild;
  label: string;
  required?: boolean;
  row?: boolean;
  spaceBetween?: boolean;
};

type State = {
  riskAssessment: {
    name?: string;
    description?: string;
    categoryId?: string;
    calculateMethod?: string;
    calculateLogics?: RiskCalculateLogicType[];
  };
};

class Form extends React.Component<Props & ICommonFormProps, State> {
  constructor(props) {
    super(props);

    this.state = {
      riskAssessment: this.props.assessmentDetail || {}
    };

    this.generateDoc = this.generateDoc.bind(this);
  }

  generateDoc(values) {
    const { riskAssessment } = this.state;
    const { assessmentDetail } = this.props;
    if (assessmentDetail) {
      delete values.logic;
      delete values.value;
      delete values.value2;
      riskAssessment.calculateLogics?.forEach(logic => delete logic.__typename);
      return {
        id: assessmentDetail._id,
        doc: { ...values, calculateLogics: riskAssessment.calculateLogics }
      };
    }
    return { ...values, ...riskAssessment };
  }

  renderLogic({ _id, name, logic, value, value2, color }: RiskCalculateLogicType, formProps) {
    const handleRow = e => {
      const { riskAssessment } = this.state;
      const { name, value } = e.currentTarget as HTMLInputElement;
      const newVariables =
        riskAssessment.calculateLogics &&
        riskAssessment?.calculateLogics.map(logic =>
          logic._id === _id
            ? { ...logic, [name]: ['value', 'value2'].includes(name) ? parseInt(value) : value }
            : logic
        );
      this.setState(prev => ({
        riskAssessment: { ...prev.riskAssessment, calculateLogics: newVariables }
      }));
    };

    const removeLogicRow = e => {
      const { riskAssessment } = this.state;
      const removedLogicRows =
        riskAssessment.calculateLogics &&
        riskAssessment?.calculateLogics.filter(logic => logic._id !== _id);
      this.setState(prev => ({
        riskAssessment: { ...prev.riskAssessment, calculateLogics: removedLogicRows }
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
        riskAssessment: { ...prev.riskAssessment, calculateLogics: newVariables }
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
            {['(>) greater than', '(<) lower than', '(≈) between'].map(value => (
              <option value={value} key={value}>
                {value}
              </option>
            ))}
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
      riskAssessment.calculateLogics.map(logic => this.renderLogic(logic, formProps))
    );
  }

  renderContent = (formProps: IFormProps) => {
    const { categories, loading, detailLoading, categoryId } = this.props;
    const { riskAssessment } = this.state;

    const CustomFormGroup = ({
      children,
      label,
      required,
      row,
      spaceBetween
    }: CustomFromGroupProps) => {
      return (
        <FormGroupRow horizontal={row} spaceBetween={spaceBetween}>
          <ControlLabel required={required}>{label}</ControlLabel>
          {children}
        </FormGroupRow>
      );
    };

    if (detailLoading) {
      return <Spinner objective />;
    }

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
          calculateLogics: [...(prev.riskAssessment.calculateLogics || []), variables]
        }
      }));
    };
    const handleState = e => {
      e.preventDefault();
      e.stopPropagation();

      const { name, value } = e.currentTarget as HTMLInputElement;

      this.setState(prev => ({ riskAssessment: { ...prev.riskAssessment, [name]: value } }));
    };

    return (
      <>
        <CustomFormGroup label="Risk Assessment Name" required>
          <FormControl
            {...formProps}
            name="name"
            type="text"
            required={true}
            defaultValue={riskAssessment.name}
            onChange={handleState}
          />
        </CustomFormGroup>
        <CustomFormGroup label="Risk Assessment Description">
          <FormControl
            {...formProps}
            name="description"
            componentClass="textarea"
            defaultValue={riskAssessment.description}
            onChange={handleState}
          />
        </CustomFormGroup>
        <CustomFormGroup label="Risk Assessment Category">
          {loading ? (
            <Spinner objective />
          ) : (
            <FormControl
              {...formProps}
              name="categoryId"
              componentClass="select"
              onChange={handleState}
              defaultValue={!categoryId ? riskAssessment.categoryId : categoryId}
              required
            >
              <option />
              {categories.map(category => (
                <option value={category._id} key={category._id}>
                  {category.parentId && subOption(category)}
                  {category.name}
                </option>
              ))}
            </FormControl>
          )}
        </CustomFormGroup>
        <CustomFormGroup label="Risk Assessment Calculation Method">
          <FormControl
            {...formProps}
            required
            name="calculateMethod"
            componentClass="select"
            defaultValue={riskAssessment.calculateMethod}
            onChange={handleState}
          >
            <option />
            {['Addition', 'Multiply', 'Matrix'].map(value => (
              <option value={value} key={value}>
                {value}
              </option>
            ))}
          </FormControl>
        </CustomFormGroup>
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
      </>
    );
  };

  render() {
    const { assessmentDetail, renderButton } = this.props;

    const renderBtn = () => {
      if (!assessmentDetail?.status) {
        return renderButton;
      }
      if (assessmentDetail.status === 'In Progress') {
        return renderButton;
      }
    };

    return (
      <CommonForm
        {...this.props}
        renderContent={this.renderContent}
        generateDoc={this.generateDoc}
        object={this.props.object}
        renderButton={renderBtn()}
        createdAt={assessmentDetail?.createdAt}
      />
    );
  }
}

export default Form;
