import {
  ContentColumn,
  ContentRowTitle,
  Divider,
  WrongLess,
  PaymentTypeScoreCampaign,
  FlexRowGap,
} from "../../styles";
import Select, { components } from "react-select";

import CURRENCIES from "@erxes/ui/src/constants/currencies";
import ControlLabel from "@erxes/ui/src/components/form/Label";
import { Flex } from "@erxes/ui/src/styles/main";
import FormControl from "@erxes/ui/src/components/form/Control";
import { IDeal, IPaymentsData } from "../../types";
import { PAYMENT_TYPES } from "../../constants";
import React from "react";
import { __, Alert, confirm } from "@erxes/ui/src/utils";
import { pluginsOfPaymentForm } from "coreui/pluginUtils";
import { selectConfigOptions } from "../../utils";
import { gql, useMutation, useQuery } from "@apollo/client";
import Button from "@erxes/ui/src/components/Button";
import Popover from "@erxes/ui/src/components/Popover";
import Icon from "@erxes/ui/src/components/Icon";
import { colors } from "@erxes/ui/src/styles";

type Props = {
  total: { [currency: string]: number };
  payments?: IPaymentsData;
  currencies: string[];
  onChangePaymentsData: (paymentsData: IPaymentsData) => void;
  calcChangePay: () => void;
  changePayData: { [currency: string]: number };
  pipelineDetail: any;
  dealQuery: IDeal;
};

type State = {
  paymentsData: IPaymentsData;
  checkOwnerScore: number | null;
};

const scoreCampaignQuery = `
  query checkOwnerScore($ownerId: String, $ownerType: String, $campaignId: String) {
    checkOwnerScore(ownerId: $ownerId, ownerType: $ownerType, campaignId: $campaignId)
  }
`;
const refundScoreCampaignMutation = `
    mutation RefundLoyaltyScore($ownerId: String, $ownerType: String, $targetId: String) {
     refundLoyaltyScore(ownerId: $ownerId, ownerType: $ownerType, targetId: $targetId)
    }
`;

const OwnerScoreCampaignScore = ({
  type,
  dealQuery,
  onScoreFetched,
}: {
  type: any;
  dealQuery: IDeal;
  onScoreFetched: (score: number) => void;
}) => {
  if (!type?.scoreCampaignId || !(dealQuery?.customers || [])?.length) {
    return null;
  }

  const [customer] = dealQuery.customers || [];

  const { data, refetch } = useQuery(gql(scoreCampaignQuery), {
    variables: {
      ownerType: "customer",
      ownerId: customer._id,
      campaignId: type.scoreCampaignId,
    },
    fetchPolicy: "no-cache",
  });
  const [refundLoyaltyScore] = useMutation(gql(refundScoreCampaignMutation), {
    variables: {
      ownerId: customer._id,
      ownerType: "customer",
      targetId: dealQuery._id,
    },
  });

  const { checkOwnerScore = 0 } = data || {};

  React.useEffect(() => {
    if (checkOwnerScore) {
      onScoreFetched(checkOwnerScore);
    }
  }, [checkOwnerScore, onScoreFetched]);

  const refundScore = () => {
    confirm(
      "This action will refund all loyalty scores used on this card and deduct any retrieved scores before processing the refund.\n Are you sure ?"
    ).then(() => {
      refundLoyaltyScore()
        .then(() => Alert.info("Loyalty Score refunded successfully"))
        .catch((error) => Alert.error(error.message));
      refetch();
    });
  };
  return (
    <Popover
      trigger={<Icon icon="award" size={16} color={colors.colorCoreOrange} />}
    >
      <PaymentTypeScoreCampaign>
        <p>{`Customer email: ${customer.primaryEmail}`}</p>
        <span>{`Avaible score campaign score: ${checkOwnerScore}`}</span>
        <Button
          size="small"
          btnStyle="warning"
          icon="refresh-1"
          onClick={refundScore}
        >
          {__("Return Score")}
        </Button>
      </PaymentTypeScoreCampaign>
    </Popover>
  );
};

class PaymentForm extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    const { payments } = this.props;

    this.state = {
      paymentsData: payments || {},
      checkOwnerScore: null,
    };
  }

  componentWillMount() {
    this.props.calcChangePay();
  }

  renderAmount(amount) {
    if (amount < 0) {
      return <WrongLess>{amount.toLocaleString()}</WrongLess>;
    }
    return amount.toLocaleString();
  }

  renderTotal(value) {
    return Object.keys(value).map((key) => (
      <div key={key}>
        {this.renderAmount(value[key])} <b>{key}</b>
      </div>
    ));
  }

  paymentStateChange = (kind: string, name: string, value: string | number) => {
    const { onChangePaymentsData, calcChangePay } = this.props;
    const { paymentsData } = this.state;

    const newPaymentData = {
      ...paymentsData,
      [name]: { ...paymentsData[name], [kind]: value },
    };

    onChangePaymentsData(newPaymentData);
    this.setState({ paymentsData: newPaymentData }, () => {
      calcChangePay();
    });
  };

  selectOption = (option) => (
    <div className="simple-option" key={option.label}>
      <span>{option.label}</span>
    </div>
  );

  handleScoreFetched = (score: number) => {
    this.setState({ checkOwnerScore: score });
  };

  renderPaymentsByType(type) {
    const { currencies, changePayData } = this.props;
    const { paymentsData } = this.state;
    const NAME = type.name || type.type;
    let maxVal;
    let hasPopup = false;

    if (type.scoreCampaignId) {
      maxVal = this.state.checkOwnerScore ?? 0;
      try {
        const config = JSON.parse(type.config);
        if (config?.require === 'qrCode') {
          maxVal = 0;
          hasPopup = true;
        }
      } catch (e) { }
    }

    const onChange = (e) => {
      if (
        (!paymentsData[NAME] || !paymentsData[NAME].currency) &&
        currencies.length > 0
      ) {
        this.paymentStateChange("currency", NAME, currencies[0]);
      }

      if (maxVal === undefined) {
        maxVal = parseFloat((e.target as HTMLInputElement).value || "0");
      }

      this.paymentStateChange(
        "amount",
        NAME,
        Math.min(parseFloat((e.target as HTMLInputElement).value || "0"), maxVal)
      );
    };

    const currencyOnChange = (currency) => {
      this.paymentStateChange("currency", NAME, currency ? currency.value : "");
    };

    const onClickFunc = () => {
      Object.keys(changePayData).forEach((key) => {
        if (
          changePayData[key] > 0 &&
          (!paymentsData[NAME] || !paymentsData[NAME].amount)
        ) {
          if (maxVal === undefined) {
            maxVal = changePayData[key];
          }

          const possibleVal = Math.min(changePayData[key], maxVal);
          changePayData[key] = changePayData[key] - possibleVal;

          const newPaymentsData = {
            ...paymentsData,
            [NAME]: {
              amount: possibleVal,
              currency: key
            }
          }
          this.setState({
            paymentsData: newPaymentsData
          }, () => {
            this.props.onChangePaymentsData(newPaymentsData);
          });
          return;
        }
      });
    }

    const onClick = () => {
      if (hasPopup) {
        confirm('Read QRCODE', {
          hasPasswordConfirm: true,
          beforeDismiss: () => {
            maxVal = 0;
            const newPaymentsData = {
              ...paymentsData,
              [NAME]: {
                amount: 0,
                currency: ''
              }
            }
            this.setState({
              paymentsData: newPaymentsData
            }, () => {
              this.props.onChangePaymentsData(newPaymentsData);
            });
          }
        })
          .then((qrString) => {
            const [customer] = this.props.dealQuery.customers || [];
            if (qrString && customer?._id === qrString) {
              maxVal = this.state.checkOwnerScore ?? 0;
            } else {
              maxVal = 0;
            }
          })
          .then(() => {
            onClickFunc();
          })
          .catch((error) => {
            Alert.error(error.message);
          });
      } else {
        onClickFunc();
      }
    };

    const Option = (props) => {
      return (
        <components.Option {...props} key={type}>
          {this.selectOption(props.data)}
        </components.Option>
      );
    };

    const selectOptions = selectConfigOptions(currencies, CURRENCIES);

    return (
      <Flex key={type.name} >
        <ContentColumn>
          <FlexRowGap>
            <ControlLabel>{__(type.title)}</ControlLabel>
            <OwnerScoreCampaignScore
              type={type}
              dealQuery={this.props.dealQuery}
              onScoreFetched={this.handleScoreFetched}
            />
          </FlexRowGap>
        </ContentColumn>

        <ContentColumn>
          <FormControl
            value={paymentsData[NAME] ? paymentsData[NAME].amount : ""}
            type="number"
            placeholder={__("Type amount")}
            min={0}
            name={NAME}
            disabled={maxVal === 0 && !hasPopup}
            onChange={onChange}
            onClick={onClick}
          />
        </ContentColumn>
        <ContentColumn>
          <Select
            name={type.name}
            placeholder={__("Choose currency")}
            value={selectOptions.find(
              (option) =>
                option.value ===
                (paymentsData[NAME] ? paymentsData[NAME].currency : 0)
            )}
            onChange={currencyOnChange}
            components={{ Option }}
            isClearable={true}
            options={selectOptions}
          />
        </ContentColumn>
      </Flex>
    );
  }

  renderPayments() {
    const pipelinePayments = this.props.pipelineDetail?.paymentTypes || [];

    const keys = [
      ...PAYMENT_TYPES.map((t) => t.type),
      ...pipelinePayments.map((paymentType) => paymentType.type),
    ];
    const alreadyNotExistsTypes = Object.keys(this.props.payments || {})
      .filter((name) => !keys.includes(name))
      .map((name) => ({ type: name, title: name }));

    return [
      ...PAYMENT_TYPES,
      ...pipelinePayments,
      ...alreadyNotExistsTypes,
    ].map((type) => this.renderPaymentsByType(type));
  }

  render() {
    const { total } = this.props;

    return (
      <>
        <ContentRowTitle>
          <ContentColumn>
            <ControlLabel>Total</ControlLabel>
            {this.renderTotal(total)}
          </ContentColumn>
          <ContentColumn>
            <ControlLabel>Change</ControlLabel>
            {this.renderTotal(this.props.changePayData)}
          </ContentColumn>
        </ContentRowTitle>
        <Divider />

        {this.renderPayments()}
        {pluginsOfPaymentForm((type) => this.renderPaymentsByType(type))}
      </>
    );
  }
}

export default PaymentForm;
