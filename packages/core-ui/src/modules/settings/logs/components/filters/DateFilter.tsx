import { __, router } from "@erxes/ui/src/utils";
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
  queryParams: Record<string, string>;
};

function DateFilter({ queryParams }: Props) {
  const location = useLocation();
  const navigate = useNavigate();

  const onChangeRangeFilter = (kind, date) => {
    if (dayjs(date).isValid()) {
      const cDate = dayjs(date).format("YYYY-MM-DD HH:mm");

      router.setParams(navigate, location, { [kind]: cDate });
    }
  };

  return (
    <Box
      title={__("Filter by Date")}
      name="showFilterByDate"
      isOpen={queryParams.startDate || queryParams.endDate ? true : false}
    >
      <FilterContainer>
        <ControlLabel>{`Created Date range:`}</ControlLabel>
        <CustomRangeContainer>
          <DateContainer>
            <Datetime
              dateFormat="yyyy-MM-dd"
              placeholder="Start Date"
              timeFormat="HH:mm"
              value={queryParams.startDate || ""}
              onChange={(e) => onChangeRangeFilter("startDate", e)}
              className={"filterDate form-control"}
            />
          </DateContainer>
          <EndDateContainer>
            <DateContainer>
              <Datetime
                placeholder="End Date"
                dateFormat="yyyy-MM-dd"
                timeFormat="HH:mm"
                value={queryParams.endDate || ""}
                onChange={(e) => onChangeRangeFilter("endDate", e)}
                className={"filterDate form-control"}
              />
            </DateContainer>
          </EndDateContainer>
        </CustomRangeContainer>
      </FilterContainer>
    </Box>
  );
}

export default DateFilter;
