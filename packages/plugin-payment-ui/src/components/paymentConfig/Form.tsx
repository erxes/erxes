import React from "react";

import { IPaymentDocument, IPaymentConfig } from "../../types";
import { IOption } from "@erxes/ui/src/types";
import { __ } from "@erxes/ui/src/utils/core";
import { ControlLabel } from "@erxes/ui/src/components/form";
import Select from "react-select";

type Props = {
  payments: IPaymentDocument[];
  isRequired?: boolean;
  description?: string;
  contentType: string;
  contentTypeId?: string;
  currentConfig?: IPaymentConfig;
  selectedPaymentIds: string[];
  isSubmitted?: boolean;
  setPaymentIds: (paymentIds: string[]) => void;
  save: () => void;
};

function SelectPayments(props: Props) {
  const [isSubmitted, setIsSubmitted] = React.useState(false);

  const generateOptions = (array: IPaymentDocument[] = []): IOption[] => {
    return array.map((item) => {
      const payment = item || ({} as IPaymentDocument);

      return {
        value: payment._id,
        label: `${payment.kind}: ${payment.name}`,
      };
    });
  };

  const onChange = (entries) => {
    props.setPaymentIds(entries.map((entry) => entry.value));
  };

  const { payments } = props;

  React.useEffect(() => {
    if (props.currentConfig) {
      props.setPaymentIds(props.currentConfig.paymentIds);
    }

    if (
      props.isSubmitted &&
      !isSubmitted &&
      props.contentType &&
      props.contentTypeId
    ) {
      setIsSubmitted(true);
      props.save();
    }
  }, [props.currentConfig, props.isSubmitted]);

  return (
    <div>
      <ControlLabel required={props.isRequired}>Payments</ControlLabel>
      <p>
        {props.description
          ? props.description
          : __("Select payments that you want to use ")}
      </p>

      <Select
        isMulti={true}
        options={generateOptions(payments)}
        value={generateOptions(payments).filter((o) =>
          props.selectedPaymentIds.includes(o.value)
        )}
        onChange={onChange}
        isDisabled={props.isSubmitted}
      />
    </div>
  );
}

export default SelectPayments;
