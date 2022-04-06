import React from "react";
import { AmountContainer } from "../../styles";

type Props = {
  response: any;
};

const LocaleField = (text, data) => {
  return (
    <p>
      <b>{text}:</b>
      <span>
        {data.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
        ₮
      </span>
    </p>
  );
}

export default function Amount({ response }: Props) {
  const { currentConfig } = React.useContext(AppContext);
  const taxAmount = calcTaxAmount(response.totalAmount, currentConfig && currentConfig.ebarimtConfig);

  return (
    <AmountContainer className="block">
      <div className="response-amounts">
        <div>
          <div className="sep" />
          <LocaleField text="Дүн" data={response.totalAmount} />
          <div className="sep" />
          <LocaleField text="НӨАТ" data={taxAmount.vatAmount} />
          <LocaleField text="НХАТ" data={taxAmount.cityTaxAmount} />
        </div>
        <div className="sep" />
        {response.status === "paid" ? <div className="sep" /> : null}
        <LocaleField text="Бэлнээр" data={response.cashAmount} />
        <LocaleField text="Картаар" data={response.cardAmount} />
        <LocaleField text="Мобайл" data={response.mobileAmount} />
      </div>
    </AmountContainer>
  );
}
