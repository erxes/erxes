import React from "react";
import { AmountContainer } from "../../styles";

type Props = {
  response: any;
};

const LocaleField = (text, value) => {
  return (
    <p>
      <b>{text}:</b>
      <span>
        {value.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
        ₮
      </span>
    </p>
  );
}

export default function Amount({ response }: Props) {
  // const { currentConfig } = React.useContext(AppContext);
  // const taxAmount = calcTaxAmount(response.totalAmount, currentConfig && currentConfig.ebarimtConfig);

  return (
    <AmountContainer className="block">
      <div className="response-amounts">
        <div>
          <div className="sep" />
          {LocaleField('Дүн', response.amount || 0)}
          {/* <LocaleField text="Дүн" value={response.totalAmount} /> */}
          {/* <div className="sep" /> */}
          {/* <LocaleField text="НӨАТ" value={taxAmount.vatAmount} />
          <LocaleField text="НХАТ" value={taxAmount.cityTaxAmount} /> */}
        </div>
        <div className="sep" />
        {/* {response.status === "paid" ? <div className="sep" /> : null} */}
        {/* <LocaleField text="Бэлнээр" value={response.cashAmount} />
        <LocaleField text="Картаар" value={response.cardAmount} />
        <LocaleField text="Мобайл" value={response.mobileAmount} /> */}
      </div>
    </AmountContainer>
  );
}
