import { gql, useMutation, useQuery } from "@apollo/client";
import Button from "@erxes/ui/src/components/Button";
import FormControl from "@erxes/ui/src/components/form/Control";
import ControlLabel from "@erxes/ui/src/components/form/Label";
import Icon from "@erxes/ui/src/components/Icon";
import Popover from "@erxes/ui/src/components/Popover";
import Spinner from '@erxes/ui/src/components/Spinner';
import CURRENCIES from "@erxes/ui/src/constants/currencies";
import { colors } from "@erxes/ui/src/styles";
import { Flex } from "@erxes/ui/src/styles/main";
import { __, Alert, confirm } from "@erxes/ui/src/utils";
import { pluginsOfPaymentForm } from "coreui/pluginUtils";
import React from "react";
import Select, { components } from "react-select";
import { PAYMENT_TYPES } from "../../constants";
import {
  ContentColumn,
  ContentRowTitle,
  Divider,
  FlexRowGap,
  PaymentTypeScoreCampaign,
  WrongLess,
} from "../../styles";
import { IDeal, IPaymentsData } from "../../types";
import { selectConfigOptions } from "../../utils";

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

interface IPerPayInfo {
  maxVal?: number
  hasPopup?: boolean;
  validQr?: boolean;
}

type State = {
  paymentTypes: any[];
  paymentsData: IPaymentsData;
  checkOwnerScore?: number;
  payInfoByType?: { [type: string]: IPerPayInfo };
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

  const { data, refetch, loading } = useQuery(gql(scoreCampaignQuery), {
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
  }, [checkOwnerScore, onScoreFetched, loading]);

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

  if (loading) {
    return <Spinner />;
  }

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

    const pipelinePayments = this.props.pipelineDetail?.paymentTypes || [];

    const keys = [
      ...PAYMENT_TYPES.map((t) => t.type),
      ...pipelinePayments.map((paymentType) => paymentType.type),
    ];
    const alreadyNotExistsTypes = Object.keys(this.props.payments || {})
      .filter((name) => !keys.includes(name))
      .map((name) => ({ type: name, title: name }));

    const paymentTypes = [
      ...PAYMENT_TYPES,
      ...pipelinePayments,
      ...alreadyNotExistsTypes,
    ]

    this.state = {
      paymentTypes,
      paymentsData: payments || {},
      checkOwnerScore: undefined,
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
    this.setState({ checkOwnerScore: score }, () => {
      const { payInfoByType = {}, paymentTypes } = this.state;

      paymentTypes.forEach((type) => {
        const thisPayInfo: IPerPayInfo = {};
        if (type.scoreCampaignId) {
          thisPayInfo.maxVal = this.state.checkOwnerScore ?? 0;
          try {
            const config = JSON.parse(type.config);
            if (config?.require === 'qrCode') {
              thisPayInfo.maxVal = 0;
              thisPayInfo.hasPopup = true;
            }
          } catch (e) {
            thisPayInfo.maxVal = undefined;
            thisPayInfo.hasPopup = false;
          }
        }
        payInfoByType[type] = thisPayInfo;
      });

      this.setState({ payInfoByType })
    });

  };

  renderPaymentsByType(type) {
    const { currencies, changePayData } = this.props;
    const { paymentsData, payInfoByType = {} } = this.state;
    const NAME = type.name || type.type;
    const thisPayInfo = payInfoByType[type] || {};

    const onChange = (e) => {
      if (
        (!paymentsData[NAME] || !paymentsData[NAME].currency) &&
        currencies.length > 0
      ) {
        this.paymentStateChange("currency", NAME, currencies[0]);
      }

      if (thisPayInfo.maxVal === undefined) {
        thisPayInfo.maxVal = parseFloat((e.target as HTMLInputElement).value || "0");
      }

      this.setState({ payInfoByType: { ...payInfoByType, thisPayInfo } });
      this.paymentStateChange(
        "amount",
        NAME,
        Math.min(parseFloat((e.target as HTMLInputElement).value || "0"), thisPayInfo.maxVal)
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
          if (thisPayInfo.maxVal === undefined) {
            thisPayInfo.maxVal = changePayData[key];
          }

          const possibleVal = Math.min(changePayData[key], thisPayInfo.maxVal);
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
          this.setState({ payInfoByType: { ...payInfoByType, thisPayInfo } });
          return;
        }
      });
    }

    const onClick = () => {
      if (thisPayInfo.hasPopup && !thisPayInfo.validQr) {
        confirm('Read QRCODE', {
          hasPasswordConfirm: true,
          beforeDismiss: () => {
            thisPayInfo.maxVal = 0;
            this.setState({ payInfoByType: { ...payInfoByType, thisPayInfo } });
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
              thisPayInfo.validQr = true;
              thisPayInfo.maxVal = this.state.checkOwnerScore ?? 0;
            } else {
              thisPayInfo.maxVal = 0;
            }
            this.setState({ payInfoByType: { ...payInfoByType, thisPayInfo } });
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
            disabled={thisPayInfo.maxVal === 0 && !thisPayInfo.hasPopup}
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
    return this.state.paymentTypes.map(
      (type) => this.renderPaymentsByType(type)
    );
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
