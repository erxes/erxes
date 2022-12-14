import CommonForm from '@erxes/ui-settings/src/common/components/Form';
import { ICommonFormProps } from '@erxes/ui-settings/src/common/types';
import { Button, FormGroup, Spinner, Tip, __ } from '@erxes/ui/src';
import FormControl from '@erxes/ui/src/components/form/Control';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import { ColorPick, ColorPicker, FormColumn, FormWrapper } from '@erxes/ui/src/styles/main';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import React from 'react';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';
import TwitterPicker from 'react-color/lib/Twitter';
import Select from 'react-select-plus';
import { calculateMethods, COLORS } from '../common/constants';
import { RiskAssessmentsType, RiskCalculateLogicType } from '../common/types';
import { SelectWithCategory } from '../common/utils';
import { FormContainer } from '../styles';

type Props = {
  assessmentDetail?: RiskAssessmentsType;
  detailLoading?: boolean;
  renderButton?: (props: IButtonMutateProps) => JSX.Element;
  categoryId?: string;
  fieldsSkip?: any;
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
      riskAssessment: props.assessmentDetail || { categoryId: props.categoryId || '' }
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
      riskAssessment.calculateLogics?.forEach(logic => delete logic.__typename);
      if (fieldsSkip) {
        return {
          ...values,
          calculateMethod: riskAssessment.calculateMethod,
          categoryId: riskAssessment.categoryId,
          calculateLogics: riskAssessment.calculateLogics
        };
      }
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
            ? {
                ...logic,
                [name]: ['value', 'value2'].includes(name) ? parseInt(value) : value
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
    const { detailLoading } = this.props;
    const { riskAssessment } = this.state;

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
      const { name, value } = e.currentTarget as HTMLInputElement;
      this.setState(prev => ({
        riskAssessment: { ...prev.riskAssessment, [name]: value }
      }));
    };

    const handleChangeCategory = value => {
      this.setState(prev => ({
        riskAssessment: { ...prev.riskAssessment, categoryId: value }
      }));
    };

    const handleChangeCalculateMethod = ({ value }) => {
      this.setState(prev => ({
        riskAssessment: { ...prev.riskAssessment, calculateMethod: value }
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
          <ControlLabel>{__('Category')}</ControlLabel>
          <SelectWithCategory
            name="categoryId"
            label="Choose Category"
            multi={false}
            initialValue={riskAssessment?.categoryId}
            onSelect={handleChangeCategory}
          />
        </FormGroup>
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
      </>
    );
  };

  render() {
    const { assessmentDetail, renderButton } = this.props;

    return (
      <CommonForm
        {...this.props}
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
