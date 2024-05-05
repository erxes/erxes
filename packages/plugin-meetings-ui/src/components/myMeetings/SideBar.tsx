import { EndDateContainer, FlexColumnCustom } from "../../styles";
import React, { useState } from "react";
import { __, router } from "@erxes/ui/src/utils";
import { useLocation, useNavigate } from "react-router-dom";

import Button from "@erxes/ui/src/components/Button";
import { CustomRangeContainer } from "../../styles";
import { DateContainer } from "@erxes/ui/src/styles/main";
import DateControl from "@erxes/ui/src/components/form/DateControl";
import { IUser } from "@erxes/ui/src/auth/types";
import SelectCompanies from "@erxes/ui-contacts/src/companies/containers/SelectCompanies";
import SelectTeamMembers from "@erxes/ui/src/team/containers/SelectTeamMembers";
import Sidebar from "@erxes/ui/src/layout/components/Sidebar";
import moment from "moment";

type Props = {
  currentUser: IUser;

  queryParams: any;
};

const LeftSideBar = (props: Props) => {
  const { queryParams } = props;
  const [companyId, setCompanyId] = useState(queryParams?.companyId || "");
  const [userId, setUserId] = useState(queryParams?.ownerId || "");
  const [createdAtFrom, setCreatedForm] = useState(
    queryParams.createdAtFrom || ""
  );
  const location = useLocation();
  const navigate = useNavigate();

  const [createdAtTo, setCreatedAtTo] = useState(queryParams.createdAtTo || "");

  const cleanFilter = () => {
    router.removeParams(
      navigate,
      location,
      "createdAtFrom",
      "createdAtTo",
      "ownerId",
      "companyId"
    );
    setCompanyId(undefined);
    setCreatedAtTo(undefined);
    setCreatedForm(undefined);
    setUserId(undefined);
    removePageParams();
  };

  const removePageParams = () => {
    router.removeParams(navigate, location, "page", "perPage");
  };

  const setFilter = (name, value) => {
    if (name === "companyId") {
      setCompanyId(value);
    }
    if (name === "ownerId") {
      setUserId(value);
    }
    router.setParams(navigate, location, { [name]: value });
  };

  const handleSelectDate = (value, name) => {
    if ("createdAtTo" === name) {
      value = moment(value).format(`YYYY/MM/DD hh:mm`);
      setCreatedAtTo(value);
    }
    if ("createdAtFrom" === name) {
      value = moment(value).format(`YYYY/MM/DD hh:mm`);
      setCreatedForm(value);
    }
    value !== "Invalid date" &&
      router.setParams(navigate, location, { [name]: value });
  };

  return (
    <Sidebar wide={true} hasBorder={true}>
      <FlexColumnCustom $marginNum={20}>
        <SelectCompanies
          label="Filter by company"
          name="companyId"
          initialValue={companyId}
          onSelect={(companyId) => setFilter("companyId", companyId)}
          customOption={{ value: "", label: "... Choose company" }}
          multi={false}
        />

        <CustomRangeContainer>
          <DateContainer>
            <DateControl
              name="createdAtFrom"
              placeholder="Choose start date"
              value={createdAtFrom}
              onChange={(e) => handleSelectDate(e, "createdAtFrom")}
            />
          </DateContainer>
          <EndDateContainer>
            <DateContainer>
              <DateControl
                name="createdAtTo"
                placeholder="Choose end date"
                value={createdAtTo}
                onChange={(e) => handleSelectDate(e, "createdAtTo")}
              />
            </DateContainer>
          </EndDateContainer>
        </CustomRangeContainer>

        <SelectTeamMembers
          label="Filter by created member"
          name="ownerId"
          multi={false}
          initialValue={userId}
          customOption={{ value: "", label: "... Choose created member" }}
          onSelect={(ownerId) => setFilter("ownerId", ownerId)}
        />

        <Button btnStyle="warning" onClick={cleanFilter}>
          Clear filter
        </Button>
      </FlexColumnCustom>
    </Sidebar>
  );
};

export default LeftSideBar;
