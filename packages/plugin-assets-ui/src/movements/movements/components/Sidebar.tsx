import {
  Box,
  Button,
  FormGroup as CommonFormGroup,
  Sidebar as CommonSideBar,
  ControlLabel,
  DateControl,
  Icon,
  SelectTeamMembers,
  Tip,
  Wrapper,
  __,
  router,
} from "@erxes/ui/src";
import {
  ContainerBox,
  CustomRangeContainer,
  EndDateContainer,
} from "../../../style";

import { DateContainer } from "@erxes/ui/src/styles/main";
import React from "react";
import dayjs from "dayjs";

type Props = {
  queryParams: any;
  navigate: any;
  location: any;
};

const fields = [
  "userId",
  "createdAtFrom",
  "createdAtTo",
  "movedAtFrom",
  "movedAtTo",
  "modifiedAtFrom",
  "modifiedAtTo",
];

const { Section } = Wrapper.Sidebar;

const Sidebar = (props: Props) => {
  const { queryParams, navigate, location } = props;

  const handleDate = (field, date) => {
    if (dayjs(date).isValid()) {
      router.setParams(navigate, location, {
        [field]: dayjs(date).format("YYYY-MM-DD HH:mm"),
        page: undefined,
      });
    }
  };

  const handleValue = (value, name) => {
    if (value === "") {
      return router.removeParams(navigate, location, "userId");
    }
    router.setParams(navigate, location, { userId: value });
  };

  const clearParams = (field) => {
    if (Array.isArray(field)) {
      field.forEach((name) => {
        return router.removeParams(navigate, location, name);
      });
    }
    router.removeParams(navigate, location, field);
  };

  const FormGroup = ({
    label,
    field,
    clearable,
    children,
  }: {
    label: string;
    clearable?: boolean;
    field: string | string[];
    children: React.ReactNode;
  }) => (
    <CommonFormGroup>
      <ContainerBox $row={true} $spaceBetween={true}>
        <ControlLabel>{label}</ControlLabel>
        {clearable && (
          <Button btnStyle="link" onClick={() => clearParams(field)}>
            <Tip placement="bottom" text="Clear">
              <Icon icon="cancel-1" />
            </Tip>
          </Button>
        )}
      </ContainerBox>
      {children}
    </CommonFormGroup>
  );

  const extraButton = (
    <Button btnStyle="link" onClick={() => clearParams(fields)}>
      <Tip text="Clear filters" placement="bottom">
        <Icon icon="cancel-1" />
      </Tip>
    </Button>
  );

  return (
    <CommonSideBar>
      <Section.Title>
        {__("Addition Filters")}
        <Section.QuickButtons>
          {fields.some((field) => queryParams[field]) && extraButton}
        </Section.QuickButtons>
      </Section.Title>
      <ContainerBox $vertical={true} $column={true} gap={5}>
        <FormGroup
          field="userId"
          label="Moved User"
          clearable={queryParams.userId}
        >
          <SelectTeamMembers
            label="Choose Moved User"
            name="userId"
            multi={false}
            onSelect={handleValue}
            initialValue={queryParams.userId}
            customOption={{ value: "", label: "Choose Moved User" }}
          />
        </FormGroup>
        <FormGroup
          label="Created Date Range"
          field={["createdAtFrom", "createdAtTo"]}
          clearable={queryParams?.createdAtFrom || queryParams?.createdAtTo}
        >
          <CustomRangeContainer>
            <DateContainer>
              <DateControl
                name="createdAtFrom"
                placeholder="Choose start date"
                value={queryParams?.createdAtFrom || ""}
                onChange={(e) => handleDate("createdAtFrom", e)}
              />
            </DateContainer>
            <EndDateContainer>
              <DateContainer>
                <DateControl
                  name="createdAtTo"
                  placeholder="Choose end date"
                  value={queryParams?.createdAtTo || ""}
                  onChange={(e) => handleDate("createdAtTo", e)}
                />
              </DateContainer>
            </EndDateContainer>
          </CustomRangeContainer>
        </FormGroup>
        <FormGroup
          label="Moved Date Range"
          field={["movedAtFrom", "movedAtTo"]}
          clearable={queryParams?.movedAtFrom || queryParams?.movedAtTo}
        >
          <CustomRangeContainer>
            <DateContainer>
              <DateControl
                name="movedAtFrom"
                placeholder="Choose start date"
                value={queryParams?.movedAtFrom || ""}
                onChange={(e) => handleDate("movedAtFrom", e)}
              />
            </DateContainer>
            <EndDateContainer>
              <DateContainer>
                <DateControl
                  name="movedAtTo"
                  placeholder="Choose end date"
                  value={queryParams?.movedAtTo || ""}
                  onChange={(e) => handleDate("movedAtTo", e)}
                />
              </DateContainer>
            </EndDateContainer>
          </CustomRangeContainer>
        </FormGroup>
        <FormGroup
          label="Modified Date Range"
          field={["modifiedAtFrom", "modifiedAtTo"]}
          clearable={queryParams?.modifiedAtFrom || queryParams?.modifiedAtTo}
        >
          <CustomRangeContainer>
            <DateContainer>
              <DateControl
                name="modifiedAtFrom"
                placeholder="Choose start date"
                value={queryParams?.modifiedAtFrom || ""}
                onChange={(e) => handleDate("modifiedAtFrom", e)}
              />
            </DateContainer>
            <EndDateContainer>
              <DateContainer>
                <DateControl
                  name="modifiedAtTo"
                  placeholder="Choose end date"
                  value={queryParams?.modifiedAtTo || ""}
                  onChange={(e) => handleDate("modifiedAtTo", e)}
                />
              </DateContainer>
            </EndDateContainer>
          </CustomRangeContainer>
        </FormGroup>
      </ContainerBox>
    </CommonSideBar>
  );
};

export default Sidebar;
