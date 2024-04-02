import {
  __,
  Button,
  ControlLabel,
  Form,
  FormControl,
  FormGroup,
  Icon,
  MainStyleFormColumn as FormColumn,
  MainStyleFormWrapper as FormWrapper,
  MainStyleModalFooter as ModalFooter,
  MainStyleScrollWrapper as ScrollWrapper,
  SelectTeamMembers,
  generateCategoryOptions,
  extractAttachment,
} from "@erxes/ui/src";
import { IUser } from "@erxes/ui/src/auth/types";
import {
  IButtonMutateProps,
  IFormProps,
  IAttachment,
} from "@erxes/ui/src/types";
import { ChooseColor, BackgroundSelector } from "../../styles";
import React, { useState } from "react";
import Select from "react-select";

import {
  CAR_BODY_TYPES,
  CAR_FUEL_TYPES,
  CAR_GEAR_BOXS,
  COLORS,
} from "../../constants";
import { ICar, ICarCategory, ICarDoc } from "../../types";
import { Uploader } from "@erxes/ui/src";

type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  car: ICar;
  closeModal: () => void;
  carCategories: ICarCategory[];
};

type State = {
  ownerId?: string;
  users?: IUser[];

  plateNumber: string;
  vinNumber: string;
  colorCode: string;
  categoryId: string;

  bodyType: string;
  fuelType: string;
  gearBox: string;

  vintageYear: number;
  importYear: number;

  nowYear: number;
  attachment: IAttachment | undefined;
  description: string;
};

const CarForm = (props: Props) => {
  const { car = {} as ICar, closeModal, carCategories, renderButton } = props;
  const nowYear = new Date().getFullYear();

  const [state, setState] = useState<State>({
    ownerId: car.ownerId || "",
    users: [],
    plateNumber: car.plateNumber || "",
    vinNumber: car.vinNumber || "",
    colorCode: car.colorCode || "",
    attachment: car.attachment || undefined,
    categoryId: car.categoryId || "",

    bodyType: car.bodyType || "",
    fuelType: car.fuelType || "",
    gearBox: car.gearBox || "",

    vintageYear: car.vintageYear || nowYear,
    importYear: car.importYear || nowYear,
    nowYear,
    description: car.description || "",
  });

  const generateDoc = (values: { _id: string } & ICarDoc) => {
    const finalValues = values;

    if (car) {
      finalValues._id = car._id;
    }

    return {
      _id: finalValues._id,
      ...state,
      description: finalValues.description,
      plateNumber: finalValues.plateNumber,
      vinNumber: finalValues.vinNumber,
      vintageYear: Number(finalValues.vintageYear),
      importYear: Number(finalValues.importYear),
      categoryId: finalValues.categoryId,
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

  const onBodyTypeChange = (option) => {
    setState((prevState) => ({ ...prevState, bodyType: option.value }));
  };

  const onFuelTypeChange = (option) => {
    setState((prevState) => ({ ...prevState, fuelType: option.value }));
  };

  const onGearBoxChange = (option) => {
    setState((prevState) => ({ ...prevState, gearBox: option.value }));
  };

  const onColorChange = (e) => {
    setState((prevState) => ({ ...prevState, colorCode: e }));
  };

  const renderColors = (colorCode: string) => {
    const onClick = () => onColorChange(colorCode);

    return (
      <BackgroundSelector
        key={colorCode}
        selected={state.colorCode === colorCode}
        onClick={onClick}
      >
        <div style={{ backgroundColor: colorCode }}>
          <Icon icon="check-1" />
        </div>
      </BackgroundSelector>
    );
  };

  const onChangeAttachment = (files: IAttachment[]) => {
    setState((prevState) => ({
      ...prevState,
      attachment: files.length ? files[0] : undefined,
    }));
  };

  const onSelectOwner = (value) => {
    setState((prevState) => ({ ...prevState, ownerId: value }));
  };

  const renderContent = (formProps: IFormProps) => {
    const { values, isSubmitted } = formProps;

    const attachments =
      (car.attachment && extractAttachment([car.attachment])) || [];

    return (
      <>
        <FormWrapper>
          <FormColumn>
            <FormGroup>
              <ControlLabel>Category</ControlLabel>
              <FormControl
                {...formProps}
                name="categoryId"
                componentclass="select"
                defaultValue={state.categoryId}
                required={true}
              >
                {generateCategoryOptions(carCategories, "", true)}
              </FormControl>
            </FormGroup>

            {renderFormGroup("Plate number", {
              ...formProps,
              name: "plateNumber",
              defaultValue: state.plateNumber,
            })}

            {renderFormGroup("VIN number", {
              ...formProps,
              name: "vinNumber",
              defaultValue: state.vinNumber,
            })}

            <FormGroup>
              <ControlLabel required={true}>Select a color</ControlLabel>
              <ChooseColor>
                {COLORS.map((colorCode) => renderColors(colorCode))}
              </ChooseColor>
            </FormGroup>

            <FormGroup>
              <ControlLabel>Owner</ControlLabel>
              <SelectTeamMembers
                label="Choose an owner"
                name="ownerId"
                initialValue={state.ownerId}
                onSelect={onSelectOwner}
                multi={false}
              />
            </FormGroup>
          </FormColumn>

          <FormColumn>
            {renderFormGroup("Vintage Year", {
              ...formProps,
              name: "vintageYear",
              defaultValue: state.vintageYear || state.nowYear,
              type: "number",
              min: "1950",
              max: state.nowYear,
            })}

            {renderFormGroup("Import Year", {
              ...formProps,
              name: "importYear",
              defaultValue: state.importYear || state.nowYear,
              type: "number",
              min: 1950,
              max: state.nowYear,
            })}

            <FormGroup>
              <ControlLabel>Featured image</ControlLabel>

              <Uploader
                defaultFileList={attachments}
                onChange={onChangeAttachment}
                multiple={false}
                single={true}
              />
            </FormGroup>

            <FormGroup>
              <ControlLabel>Body Type</ControlLabel>
              <Select
                value={CAR_BODY_TYPES.find((o) => o.value === state.bodyType)}
                onChange={onBodyTypeChange}
                options={CAR_BODY_TYPES}
                isClearable={false}
              />
            </FormGroup>

            <FormGroup>
              <ControlLabel>Fuel Type</ControlLabel>
              <Select
                value={CAR_FUEL_TYPES.find((o) => o.value === state.fuelType)}
                onChange={onFuelTypeChange}
                options={CAR_FUEL_TYPES}
                isClearable={false}
              />
            </FormGroup>

            <FormGroup>
              <ControlLabel>Gear Box</ControlLabel>
              <Select
                value={CAR_GEAR_BOXS.find((o) => o.value === state.gearBox)}
                onChange={onGearBoxChange}
                options={CAR_GEAR_BOXS}
                isClearable={false}
              />
            </FormGroup>
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
                defaultValue={state.description || ""}
              />
            </FormGroup>
          </FormColumn>
        </FormWrapper>

        <ModalFooter>
          <Button btnStyle="simple" onClick={closeModal} icon="cancel-1">
            Close
          </Button>

          {renderButton({
            name: "car",
            values: generateDoc(values),
            isSubmitted,
            object: props.car,
          })}
        </ModalFooter>
      </>
    );
  };
  return <Form renderContent={renderContent} />;
};

export default CarForm;
