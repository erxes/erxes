import {
  __,
  Button,
  ControlLabel,
  Form,
  FormControl,
  FormGroup,
  MainStyleFormColumn as FormColumn,
  MainStyleFormWrapper as FormWrapper,
  MainStyleModalFooter as ModalFooter,
  MainStyleScrollWrapper as ScrollWrapper,
} from '@erxes/ui/src';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import React, { useState } from 'react';
import Select from 'react-select';
import { LEVEL } from '../constants';
import { IPackage, IPackageDoc } from '../types';

type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  data?: IPackage;
  closeModal?: () => void;
};

const PackageForm: React.FC<Props> = (props: Props) => {
  const { data = {} as IPackage, closeModal, renderButton } = props;

  const [state, setState] = useState({
    name: data.name || "",
    wpId: data.wpId || "",

    level: data.level || "",
    price: data.price || 0,
    duration: data.duration || 0,
    profit: data.profit || 0,
  });

  const generateDoc = (values: { _id: string } & IPackageDoc) => {
    const finalValues = values;

    if (data) {
      finalValues._id = data._id;
    }

    return {
      _id: finalValues._id,
      ...state,
      description: finalValues.description,
      name: finalValues.name,
      wpId: finalValues.wpId,
      price: Number(finalValues.price),
      duration: Number(finalValues.duration),
      profit: Number(finalValues.profit),
    };
  };

  const renderFormGroup = (label, props) => {
    return (
      <FormGroup>
        <ControlLabel>{label}</ControlLabel>
        <FormControl {...props} />
      </FormGroup>
    );
  };

  const onLevelChange = (option) => {
    setState((prevState) => ({
      ...prevState,
      level: option.value,
    }));
  };

  const renderContent = (formProps: IFormProps) => {
    const { values, isSubmitted } = formProps;

    return (
      <>
        <ScrollWrapper>
          <FormWrapper>
            <FormColumn>
              {renderFormGroup("Name", {
                ...formProps,
                name: "name",
                defaultValue: data.name || "",
              })}

              {renderFormGroup("WP Id", {
                ...formProps,
                name: "wpId",
                defaultValue: data.wpId || "",
              })}

              <FormGroup>
                <ControlLabel>Level</ControlLabel>
                <Select
                  value={LEVEL.find((o) => o.value === state.level)}
                  onChange={onLevelChange}
                  options={LEVEL}
                  isClearable={false}
                />
              </FormGroup>
            </FormColumn>

            <FormColumn>
              {renderFormGroup("Price", {
                ...formProps,
                name: "price",
                defaultValue: data.price || 0,
                type: "number",
              })}

              {renderFormGroup("Duration", {
                ...formProps,
                name: "duration",
                defaultValue: data.duration || 0,
                type: "number",
              })}

              {renderFormGroup("Profit", {
                ...formProps,
                name: "profit",
                defaultValue: data.profit || 0,
                type: "number",
              })}
            </FormColumn>
          </FormWrapper>
          <FormWrapper>
            <FormColumn>
              <FormGroup>
                <ControlLabel>Description</ControlLabel>
                <FormControl
                  {...formProps}
                  max={140}
                  name="description"
                  componentclass="textarea"
                  defaultValue={data.description || ""}
                />
              </FormGroup>
            </FormColumn>
          </FormWrapper>
        </ScrollWrapper>

        <ModalFooter>
          <Button btnStyle="simple" onClick={closeModal} icon="cancel-1">
            Close
          </Button>

          {renderButton({
            passedName: "package",
            values: generateDoc(values),
            callback: closeModal,
            isSubmitted,
            object: data,
          })}
        </ModalFooter>
      </>
    );
  };

  return <Form renderContent={renderContent} />;
};

export default PackageForm;
