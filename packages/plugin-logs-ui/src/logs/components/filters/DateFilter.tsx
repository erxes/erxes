import { __, router } from "coreui/utils";
import React from "react";
import dayjs from "dayjs";
import { DateContainer } from "@erxes/ui/src/styles/main";
import ControlLabel from "@erxes/ui/src/components/form/Label";
import { EndDateContainer } from "@erxes/ui-forms/src/forms/styles";
import Datetime from "@nateradebaugh/react-datetime";
import Box from "@erxes/ui/src/components/Box";
import { CustomRangeContainer, FilterContainer } from "../../styles";
import { useLocation, useNavigate } from "react-router-dom";

type Props = {
  queryParams: any;
};

function DateFilter({ queryParams }: Props) {
  const location = useLocation();
  const navigate = useNavigate();

  const onChangeRangeFilter = (kind, date) => {
    if (dayjs(date).isValid()) {
      const cDate = dayjs(date).format("YYYY-MM-DD HH:mm");

      router.setParams(navigate, location, { [kind]: cDate });
      router.removeParams(navigate, location, "page");
    }
  };

  return (
    <Box
      title={__("Filter by Date")}
      name="showFilterByDate"
      isOpen={queryParams.startDate || queryParams.endDate}
    >
      <FilterContainer>
        <ControlLabel>{`Created Date range:`}</ControlLabel>
        <CustomRangeContainer>
          <DateContainer>
            <Datetime
              inputProps={{ placeholder: __("Start Date") }}
              dateFormat="YYYY-MM-DD"
              timeFormat="HH:mm"
              value={queryParams.startDate || ""}
              closeOnSelect={true}
              utc={true}
              input={true}
              onChange={onChangeRangeFilter.bind(this, "startDate")}
              viewMode={"days"}
              className={"filterDate"}
            />
          </DateContainer>
          <EndDateContainer>
            <DateContainer>
              <Datetime
                inputProps={{ placeholder: __("End Date") }}
                dateFormat="YYYY-MM-DD"
                timeFormat="HH:mm"
                value={queryParams.endDate || ""}
                closeOnSelect={true}
                utc={true}
                input={true}
                onChange={onChangeRangeFilter.bind(this, "endDate")}
                viewMode={"days"}
                className={"filterDate"}
              />
            </DateContainer>
          </EndDateContainer>
        </CustomRangeContainer>
      </FilterContainer>
    </Box>
  );
}

export default DateFilter;
