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
  confirm,
} from '@erxes/ui/src';
import {
  ControlWrapper,
  StepWrapper,
} from '@erxes/ui/src/components/step/styles';
import {
  ColorPick,
  ColorPicker,
  FormColumn,
  FormWrapper,
} from '@erxes/ui/src/styles/main';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import { COLORS, calculateMethods } from '../../common/constants';
import {
  CommonFormContainer,
  FormContainer,
  FormContent,
  Header,
} from '../../styles';
import { RiskCalculateLogicType, RiskIndicatorsType } from '../common/types';

import { gql } from '@apollo/client';
import client from '@erxes/ui/src/apolloClient';
import Popover from '@erxes/ui/src/components/Popover';
import SelectBranches from '@erxes/ui/src/team/containers/SelectBranches';
import SelectDepartments from '@erxes/ui/src/team/containers/SelectDepartments';
import React, { useState } from 'react';
import TwitterPicker from 'react-color/lib/Twitter';
import Select from 'react-select';
import { SelectOperations } from '../../common/utils';
import { SelectTags } from '../common/utils';
import { mutations } from '../graphql';
import FormItem from './FormItem';
import {
  FlexBetween,
  FlexRow,
  SubHeading,
  Title,
} from '@erxes/ui-settings/src/styles';

type Props = {
  detail?: RiskIndicatorsType;
  renderButton?: (props: IButtonMutateProps) => JSX.Element;
  duplicatIndicator: (_id: string) => void;
  navigate?: any;
};

const Form = ({ detail, duplicatIndicator, renderButton, navigate }: Props) => {
  const [indicator, setIndicator] = useState<any>(detail);
  const [isEditName, setEditName] = useState(false);

  const handleClose = () => {
    const formIds: any[] = [];

    for (const form of indicator?.forms || []) {
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
          variables: { formIds },
        });
        return navigate('/settings/risk-indicators');
      });
    }
    navigate('/settings/risk-indicators');
  };

  const handleChange = (value, name) => {
    setIndicator({ ...indicator, [name]: value });
  };
  const handleInputChange = e => {
    const { name, value } = e.currentTarget as HTMLInputElement;
    setIndicator({ ...indicator, [name]: value });
  };

  const renderContent = (formProps: IFormProps) => {
    const generateDoc = values => {
      let { calculateLogics = [], forms = [] } = indicator || {};

      delete values.logic;
      delete values.value;
      delete values.value2;

      forms = forms.map(({ __typename, ...form }) => {
        return {
          ...form,
          calculateLogics: (form?.calculateLogics || []).map(
            ({ __typename, ...logic }) => logic
          ),
        };
      });

      calculateLogics = calculateLogics.map(
        ({ __typename, ...logic }) => logic
      );

      return { ...values, ...{ ...indicator, forms, calculateLogics } };
    };

    function renderActions() {
      const { isSubmitted, values } = formProps;

      return (
        <ControlWrapper style={{ justifyContent: 'end' }}>
          {!indicator?.name || isEditName ? (
            <FormControl
              {...formProps}
              key="name"
              name="name"
              type="text"
              required={true}
              value={indicator?.name || ''}
              onChange={handleInputChange}
              onKeyPress={e => e.key === 'Enter' && setEditName(!isEditName)}
            />
          ) : (
            <SubHeading
              style={{ flex: 1 }}
              onDoubleClick={() => setEditName(!isEditName)}
            >
              {__(indicator.name)}
            </SubHeading>
          )}
          {detail && (
            <Button
              btnStyle="warning"
              icon="file-copy-alt"
              onClick={() => duplicatIndicator(detail._id)}
            >
              {__('Duplicate')}
            </Button>
          )}
          {renderButton &&
            renderButton({
              name: 'Indicator',
              values: generateDoc(values),
              isSubmitted,
              object: detail,
            })}
        </ControlWrapper>
      );
    }

    function renderGeneralStep() {
      return (
        <FormContainer $column $gap style={{ padding: 10 }}>
          <FormGroup>
            <ControlLabel>{__('Description')}</ControlLabel>
            <FormControl
              {...formProps}
              name="description"
              componentclass="textarea"
              value={indicator?.description || ''}
              onChange={handleInputChange}
            />
          </FormGroup>

          <FormGroup>
            <ControlLabel>{__('Tags')}</ControlLabel>
            <SelectTags
              name="tagIds"
              label="Choose Tags"
              initialValue={indicator?.tagIds}
              onSelect={handleChange}
              multi
            />
          </FormGroup>

          <FormContainer $row $flex $gap>
            <FormGroup>
              <ControlLabel>{__('Branches')}</ControlLabel>
              <SelectBranches
                name="branchIds"
                label="Choose Branches"
                multi={true}
                initialValue={indicator?.branchIds}
                onSelect={handleChange}
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel>{__('Departments')}</ControlLabel>
              <SelectDepartments
                name="departmentIds"
                label="Choose Departments"
                multi={true}
                initialValue={indicator?.departmentIds}
                onSelect={handleChange}
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel>{__('Operations')}</ControlLabel>
              <SelectOperations
                name="operationIds"
                label="Choose Operations"
                multi={true}
                initialValue={indicator?.operationIds}
                onSelect={handleChange}
              />
            </FormGroup>
          </FormContainer>
        </FormContainer>
      );
    }

    function renderFormsStep() {
      const toggleWithDescription = () => {
        handleChange(!indicator?.isWithDescription, 'isWithDescription');
      };

      const addForm = () =>
        handleChange(
          [
            ...(indicator?.forms || []),
            { _id: String(Math.random()), formId: '', calculateMethod: '' },
          ],
          'forms'
        );

      function renderGeneralFormsLogics() {
        if (!(indicator?.forms?.length > 1)) {
          return null;
        }

        function renderLogic({
          _id,
          name,
          logic,
          value,
          value2,
          color,
        }: RiskCalculateLogicType) {
          const handleRow = e => {
            const { name, value } = e.currentTarget as HTMLInputElement;
            const { calculateLogics = [] } = indicator || {};
            const newVariables = calculateLogics.map(logic =>
              logic._id === _id
                ? {
                    ...logic,
                    [name]: ['value', 'value2'].includes(name)
                      ? parseInt(value)
                      : value,
                  }
                : logic
            );
            handleChange(newVariables, 'calculateLogics');
          };

          const removeLogicRow = e => {
            const removedLogicRows =
              indicator.calculateLogics &&
              indicator?.calculateLogics.filter(logic => logic._id !== _id);
            handleChange(removedLogicRows, 'calculateLogics');
          };

          const onChangeColor = hex => {
            const newVariables =
              indicator.calculateLogics &&
              indicator.calculateLogics.map(logic =>
                logic._id === _id ? { ...logic, color: hex } : logic
              );
            handleChange(newVariables, 'calculateLogics');
          };

          const renderColorSelect = selectedColor => {
            return (
              <Popover
                placement="bottom-start"
                trigger={
                  <ColorPick>
                    <ColorPicker style={{ backgroundColor: selectedColor }} />
                  </ColorPick>
                }
              >
                <TwitterPicker
                  width="266px"
                  triangle="hide"
                  color={selectedColor}
                  onChange={e => onChangeColor(e.hex)}
                  colors={COLORS}
                />
              </Popover>
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
                  componentclass="select"
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
                <FormContainer $row $gap align="center">
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
                value={calculateMethods.find(
                  o => o.value === indicator?.calculateMethod
                )}
                options={calculateMethods}
                isMulti={false}
                isClearable={true}
                onChange={value => handleChange(value, 'calculateMethod')}
              />
            </FormGroup>
            <FormWrapper>
              {['Name', 'Logic', 'Value', 'Status Color'].map(head => (
                <FormColumn key={head}>
                  <ControlLabel required>{head}</ControlLabel>
                </FormColumn>
              ))}
              <Tip text="Add Level" placement="bottom">
                <Button
                  btnStyle="default"
                  icon="add"
                  onClick={() =>
                    handleChange(
                      [
                        ...(indicator.calculateLogics || []),
                        {
                          _id: Math.random().toString(),
                          name: '',
                          value: 0,
                          logic: '',
                        },
                      ],
                      'calculateLogics'
                    )
                  }
                />
              </Tip>
            </FormWrapper>
            {(indicator.calculateLogics || []).map(logic => renderLogic(logic))}
          </FormContent>
        );
      }

      function renderForms() {
        if (!indicator?.forms?.length) {
          return <EmptyState text="No Forms" icon="file-question" />;
        }

        const onChange = doc => {
          const updatedForms = (indicator?.forms || []).map(formData =>
            formData?._id === doc._id ? doc : formData
          );

          handleChange(updatedForms, 'forms');
        };

        const removeRow = (id: string) => {
          const forms = indicator.forms.filter(form => form._id !== id);

          handleChange(forms, 'forms');
        };

        return (indicator?.forms || []).map(form => (
          <FormItem
            key={form._id}
            doc={form}
            handleChange={onChange}
            remove={removeRow}
            totalFormsCount={indicator?.forms.length}
            max={100}
          />
        ));
      }

      return (
        <FormContainer $column $gap style={{ padding: 10 }}>
          {renderGeneralFormsLogics()}
          <FormWrapper>
            <FormContainer $row $gap align="center">
              <Toggle
                onChange={toggleWithDescription}
                checked={indicator?.isWithDescription}
              />
              <ControlLabel>{__('use fields with description')}</ControlLabel>
            </FormContainer>
          </FormWrapper>
          {renderForms()}
          <div style={{ textAlign: 'center' }}>
            <Button icon="plus-1" onClick={addForm}>
              {__('Add Form')}
            </Button>
          </div>
        </FormContainer>
      );
    }

    return (
      <StepWrapper>
        {renderActions()}
        <Steps>
          <Step noButton img="/images/icons/erxes-07.svg" title="General">
            {renderGeneralStep()}
          </Step>
          <Step noButton img="/images/icons/erxes-30.png" title="Forms">
            {renderFormsStep()}
          </Step>
        </Steps>
      </StepWrapper>
    );
  };

  return (
    <CommonFormContainer>
      <PageHeader>
        <BarItems>
          <Button icon="leftarrow-3" btnStyle="link" onClick={handleClose}>
            {__('Back')}
          </Button>
        </BarItems>
      </PageHeader>
      <CommonForm renderContent={renderContent} />
    </CommonFormContainer>
  );
};

export default Form;
