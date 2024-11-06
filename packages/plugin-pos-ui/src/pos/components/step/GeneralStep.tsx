import Select from "react-select";
import React, { useState } from "react";
import SelectDepartments from "@erxes/ui/src/team/containers/SelectDepartments";
import {
  __,
  ControlLabel,
  FormControl,
  FormGroup,
  Toggle,
} from "@erxes/ui/src";
import { IPos, ISlot } from "../../../types";
import { LeftItem } from "@erxes/ui/src/components/step/styles";
import { Block, BlockRow, FlexColumn, FlexItem } from "../../../styles";
import SelectBranches from "@erxes/ui/src/team/containers/SelectBranches";
import { ALLOW_TYPES } from "../../../constants";
import PosSlotPlan from "../productGroup/posSlotPlan";
import SelectBrands from "@erxes/ui/src/brands/containers/SelectBrands";

type Props = {
  onChange: (name: "pos" | "slots" | "allowTypes", value: any) => void;
  pos: IPos;
  posSlots: ISlot[];
  allowTypes: string[];
  envs: any;
};

const GeneralStep = (props: Props) => {
  const { pos, envs, onChange } = props;

  const [slots, setSlots] = useState<ISlot[]>(props.posSlots || []);
  const [allowTypes, setAllowTypes] = useState<string[]>(props.allowTypes);

  let name = "POS name";
  let description: any = "description";

  if (pos) {
    name = pos.name;
    description = pos.description;
  }

  const onChangeFunction = (name: any, value: any) => {
    onChange(name, value);
  };

  const onChangeDepartments = (departmentId) => {
    onChangeFunction("pos", { ...pos, departmentId });
  };

  const onChangeSwitchMain = (e) => {
    onChangeFunction("pos", { ...pos, [e.target.id]: e.target.checked });
  };

  const onChangeInput = (e) => {
    onChangeFunction("pos", {
      ...pos,
      [e.target.id]: (e.currentTarget as HTMLInputElement).value,
    });
  };

  const renderCauseOnline = () => {
    const onChangeBranches = (branchId) => {
      onChangeFunction("pos", { ...pos, branchId });
    };

    if (pos.isOnline) {
      const onChangeMultiBranches = (branchIds) => {
        onChangeFunction("pos", {
          ...pos,
          allowBranchIds: branchIds,
        });
      };

      return (
        <>
          <BlockRow>
            <FormGroup>
              <ControlLabel>Choose branch</ControlLabel>
              <p>{__(`If the POS has real goods, select the branch`)}</p>
              <SelectBranches
                label="Choose branch"
                name="branchId"
                initialValue={pos.branchId}
                onSelect={onChangeBranches}
                customOption={{ value: "", label: "No branch..." }}
                multi={false}
              />
            </FormGroup>
          </BlockRow>
          <BlockRow>
            <FormGroup>
              <ControlLabel>Allow branches</ControlLabel>
              <p>
                {__(`Select the potential branches for sales from this pos`)}
              </p>
              <SelectBranches
                label="Choose branch"
                name="allowBranchIds"
                initialValue={pos.allowBranchIds}
                onSelect={onChangeMultiBranches}
                multi={true}
              />
            </FormGroup>
          </BlockRow>
          <BlockRow>
            <FormGroup>
              <ControlLabel required={true}>Pos domain</ControlLabel>
              <FormControl
                id="pdomain"
                type="text"
                value={pos.pdomain || ""}
                onChange={onChangeInput}
              />
            </FormGroup>
          </BlockRow>
          <BlockRow>
            <FormGroup>
              <ControlLabel required={true}>Begin Number</ControlLabel>
              <FormControl
                id="beginNumber"
                maxLength={2}
                type="text"
                value={pos.beginNumber || ""}
                onChange={onChangeInput}
              />
            </FormGroup>
          </BlockRow>
        </>
      );
    }

    return (
      <>
        <BlockRow>
          <FormGroup>
            <ControlLabel>Choose branch</ControlLabel>
            <SelectBranches
              label="Choose branch"
              name="branchId"
              initialValue={pos.branchId}
              onSelect={onChangeBranches}
              customOption={{ value: "", label: "No branch..." }}
              multi={false}
            />
          </FormGroup>
        </BlockRow>
      </>
    );
  };

  const renderToggleType = () => {
    const handleOnChange = (i: number, option) => {
      const newTypes = [...allowTypes];
      const preChosenInd = allowTypes.indexOf(option.value);
      if (preChosenInd >= 0) {
        newTypes[preChosenInd] = "";
      }

      newTypes[i] = option.value;
      setAllowTypes(newTypes);
      onChange("allowTypes", newTypes);
    };

    const chosenTypes: string[] = [];
    const result: any[] = [];
    for (let i = 0; i < ALLOW_TYPES.length; i++) {
      const currentCh = (allowTypes || [])[i] || "";

      const options = (i !== 0 ? [{ value: "", label: "Null" }] : []).concat(
        ALLOW_TYPES.filter((at) => !chosenTypes.includes(at.value))
      );

      result.push(
        <Select
          key={i}
          options={options}
          value={options.find((o) => o.value === currentCh)}
          onChange={handleOnChange.bind(this, i)}
          isClearable={false}
        />
      );
      chosenTypes.push(currentCh);
    }
    return result;
  };

  return (
    <FlexItem>
      <FlexColumn>
        <LeftItem>
          <Block>
            <h4>{__("Pos")}</h4>
            <BlockRow>
              <FormGroup>
                <ControlLabel required={true}>Name</ControlLabel>
                <FormControl
                  id="name"
                  type="text"
                  value={name || ""}
                  onChange={onChangeInput}
                />
              </FormGroup>

              <FormGroup>
                <ControlLabel>Description</ControlLabel>
                <FormControl
                  id="description"
                  type="text"
                  value={description || ""}
                  onChange={onChangeInput}
                />
              </FormGroup>
              <FormGroup>
                <ControlLabel>Max Skip number</ControlLabel>
                <FormControl
                  id="maxSkipNumber"
                  type="number"
                  min={0}
                  max={100}
                  value={pos.maxSkipNumber || 0}
                  onChange={onChangeInput}
                />
              </FormGroup>
              <FormGroup>
                <ControlLabel>Order Password</ControlLabel>
                <FormControl
                  id="orderPassword"
                  value={pos.orderPassword || ""}
                  onChange={onChangeInput}
                />
              </FormGroup>
              <FormGroup>
                <ControlLabel>Brand</ControlLabel>
                <SelectBrands
                  label={__("Choose brands")}
                  onSelect={(brand) =>
                    onChangeFunction("pos", {
                      ...pos,
                      scopeBrandIds: [brand],
                    })
                  }
                  initialValue={pos.scopeBrandIds}
                  multi={false}
                  name="selectedBrands"
                  customOption={{
                    label: "No Brand (noBrand)",
                    value: "",
                  }}
                />
              </FormGroup>
            </BlockRow>
          </Block>

          <Block>
            <BlockRow>
              <FormGroup>
                <PosSlotPlan
                  slots={slots}
                  onSave={(slots) => {
                    setSlots(slots);
                    onChange("slots", slots);
                  }}
                  posId={pos._id}
                />
              </FormGroup>
            </BlockRow>
          </Block>
          <Block>
            <BlockRow>
              <FormGroup>
                <ControlLabel>Types:</ControlLabel>
              </FormGroup>
            </BlockRow>
            <BlockRow>{renderToggleType()}</BlockRow>
          </Block>
          <Block>
            <BlockRow>
              <FormGroup>
                <ControlLabel>Is Online</ControlLabel>
                <Toggle
                  id={"isOnline"}
                  checked={pos && pos.isOnline ? true : false}
                  onChange={onChangeSwitchMain}
                  icons={{
                    checked: <span>Yes</span>,
                    unchecked: <span>No</span>,
                  }}
                />
              </FormGroup>
              {(!envs || !envs.ALL_AUTO_INIT) && (
                <FormGroup>
                  <ControlLabel>On Server</ControlLabel>
                  <Toggle
                    id={"onServer"}
                    checked={pos && pos.onServer ? true : false}
                    onChange={onChangeSwitchMain}
                    icons={{
                      checked: <span>Yes</span>,
                      unchecked: <span>No</span>,
                    }}
                  />
                </FormGroup>
              )}
              <FormGroup>
                <ControlLabel>Choose department</ControlLabel>
                <SelectDepartments
                  label={__("Choose department")}
                  name="departmentId"
                  initialValue={pos.departmentId}
                  onSelect={onChangeDepartments}
                  multi={false}
                  customOption={{ value: "", label: "No department..." }}
                />
              </FormGroup>
            </BlockRow>
            {renderCauseOnline()}
          </Block>
        </LeftItem>
      </FlexColumn>
    </FlexItem>
  );
};

export default GeneralStep;
