import FormGroup from "@erxes/ui/src/components/form/Group";
import ControlLabel from "@erxes/ui/src/components/form/Label";
import { IOption } from "@erxes/ui/src/types";
import { __ } from "@erxes/ui/src/utils";
import React from "react";
import Select from "react-select";
import styled from "styled-components";

import { IPaymentDocument } from "../types";

const LeftContent = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`;

const Row = styled.div`
  display: flex;

  .Select {
    flex: 1;
  }

  button {
    flex-shrink: 0;
    margin-left: 10px;
    align-self: baseline;
  }
`;

type Props = {
  payments: IPaymentDocument[];
  isRequired?: boolean;
  description?: string;
  defaultValue?: string[];
  onChange: (value: string[]) => void;
};

const SelectPayments: React.FC<Props> = (props) => {
  const { payments, defaultValue, onChange, isRequired, description } = props;

  const generateOptions = (array: IPaymentDocument[] = []): IOption[] => {
    return array.map((item) => {
      const payment = item || ({} as IPaymentDocument);

      return {
        value: payment._id,
        label: `${payment.kind}: ${payment.name}`,
      };
    });
  };

  const onChangePayment = (values) => {
    onChange(values.map((item) => item.value) || []);
  };

  return (
    <FormGroup>
      <ControlLabel required={isRequired}>Payments</ControlLabel>
      <p>
        {" "}
        {description
          ? description
          : __("Select payments that you want to use ")}
      </p>
      <Row>
        <LeftContent>
          <Select
            placeholder={__("Select payments")}
            value={generateOptions(payments).filter((o) =>
              defaultValue?.includes(o.value)
            )}
            onChange={onChangePayment}
            options={generateOptions(payments)}
            isMulti={true}
          />
        </LeftContent>
      </Row>
    </FormGroup>
  );
};

export default SelectPayments;
