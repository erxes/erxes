import React, { useState, useEffect } from "react";
import SelectBranches from "@erxes/ui/src/team/containers/SelectBranches";
import SelectDepartments from "@erxes/ui/src/team/containers/SelectDepartments";
import SelectProductCategory from "@erxes/ui-products/src/containers/SelectProductCategory";
import { __ } from "@erxes/ui/src/utils";
import {
  Button,
  ControlLabel,
  Form as CommonForm,
  FormGroup,
} from "@erxes/ui/src/components";
import { IButtonMutateProps, IFormProps } from "@erxes/ui/src/types";
import {
  ITimeframe,
  ITimeProportion,
  ITimeProportionParams,
} from "../../types";
import {
  MainStyleModalFooter as ModalFooter,
  MainStyleScrollWrapper as ScrollWrapper,
} from "@erxes/ui/src/styles/eindex";
import { FlexItem, FlexRow } from "@erxes/ui-settings/src/styles";
import FormControl from "@erxes/ui/src/components/form/Control";

type Props = {
  timeframes: ITimeframe[];
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  closeModal: () => void;
};

const Form = (props: Props) => {
  const { timeframes, renderButton, closeModal } = props;

  const [timesParams, setTimesParams] = useState<ITimeProportionParams>({
    percents: timeframes.map((tf) => ({
      _id: String(Math.random()),
      timeId: tf._id || "",
      percent: tf.percent || 0,
    })),
  });

  const [sumPercent, setSumPercent] = useState<number>(
    timeframes.length
      ? timeframes
          .map((tf) => tf?.percent || 0)
          .reduce((sum, per) => sum + per, 0)
      : 0
  );

  const generateDoc = (values: { _id?: string }) => {
    const finalValues = values;

    return {
      ...finalValues,
      ...timesParams,
    };
  };

  const onInputChange = (e) => {
    e.preventDefault();
    const value = e.target.value;
    const name = e.target.name;

    setTimesParams({ ...timesParams, [name]: value });
  };

  const onSelectChange = (name, value) => {
    setTimesParams((prevTimesParams) => ({
      ...prevTimesParams,
      [name]: value,
    }));
  };

  const renderPercent = (percent) => {
    const onChange = (e) => {
      const value = Number(e.target.value);

      setTimesParams((prevTimesParams) => {
        const updatedPercents = (prevTimesParams.percents || []).map((p) =>
          p.timeId === percent.timeId ? { ...p, percent: value } : p
        );

        const newTimesParams = {
          ...prevTimesParams,
          percents: updatedPercents,
        };

        const pers = newTimesParams.percents;
        setSumPercent(
          pers && pers.length
            ? pers.map((tf) => tf.percent).reduce((sum, per) => sum + per)
            : 0
        );

        return newTimesParams;
      });
    };

    const percentInfo =
      timeframes.find((tf) => tf._id === percent.timeId) || {};

    return (
      <FlexRow key={percent._id}>
        <FlexItem>
          <ControlLabel>{percentInfo.name}</ControlLabel>
        </FlexItem>
        <FlexItem>{`${percentInfo.description}`}</FlexItem>
        <FlexItem>{percentInfo.startTime}</FlexItem>
        <FlexItem>{percentInfo.endTime}</FlexItem>
        <FlexItem>
          <FormControl
            type="number"
            componentclass="number"
            min={0}
            max={100}
            id={`${percent._id}`}
            value={percent.percent || 0}
            onChange={onChange}
          />
        </FlexItem>
      </FlexRow>
    );
  };

  const renderTimes = () => {
    const { percents } = timesParams;

    return (
      <>
        <FlexRow>
          <FlexItem>
            <ControlLabel>Name</ControlLabel>
          </FlexItem>
          <FlexItem>
            <ControlLabel>Description</ControlLabel>
          </FlexItem>
          <FlexItem>
            <ControlLabel>Start time (Hour)</ControlLabel>
          </FlexItem>
          <FlexItem>
            <ControlLabel>End time (Hour)</ControlLabel>
          </FlexItem>
          <FlexItem>
            <ControlLabel>Percent</ControlLabel>
          </FlexItem>
        </FlexRow>
        {(percents || []).map((p) => renderPercent(p))}
        <FlexRow>Summary Percent: {sumPercent}</FlexRow>
      </>
    );
  };

  const renderContent = (formProps: IFormProps) => {
    const { values, isSubmitted } = formProps;

    return (
      <>
        <FormGroup>
          <ControlLabel>Branch</ControlLabel>
          <SelectBranches
            label="Choose branch"
            name="branchId"
            initialValue={""}
            onSelect={(branchIds) => onSelectChange("branchIds", branchIds)}
            multi={false}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>Department</ControlLabel>
          <SelectDepartments
            label="Choose department"
            name="departmentId"
            initialValue={""}
            onSelect={(departmentIds) =>
              onSelectChange("departmentIds", departmentIds)
            }
            multi={false}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>Product Category</ControlLabel>
          <SelectProductCategory
            label="Choose product category"
            name="productCategoryId"
            initialValue={""}
            onSelect={(categoryId) =>
              onSelectChange("productCategoryId", categoryId)
            }
            multi={false}
          />
        </FormGroup>
        {renderTimes()}
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
            values: generateDoc(values),
            isSubmitted,
            callback: closeModal,
            object: timesParams,
          })}
        </ModalFooter>
      </>
    );
  };

  return <CommonForm renderContent={renderContent} />;
};

export default Form;
