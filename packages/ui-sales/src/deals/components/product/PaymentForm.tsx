import {
  ContentColumn,
  ContentRowTitle,
  Divider,
  WrongLess,
} from '../../styles';
import Select, { components } from 'react-select';

import CURRENCIES from '@erxes/ui/src/constants/currencies';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import { Flex } from '@erxes/ui/src/styles/main';
import FormControl from '@erxes/ui/src/components/form/Control';
import { IDeal, IPaymentsData } from '../../types';
import { PAYMENT_TYPES } from '../../constants';
import React from 'react';
import { __ } from '@erxes/ui/src/utils';
import { pluginsOfPaymentForm } from 'coreui/pluginUtils';
import { selectConfigOptions } from '../../utils';
import { gql, useQuery } from '@apollo/client';

type Props = {
  total: { [currency: string]: number };
  payments?: IPaymentsData;
  currencies: string[];
  onChangePaymentsData: (paymentsData: IPaymentsData) => void;
  calcChangePay: () => void;
  changePayData: { [currency: string]: number };
  pipelineDetail: any;
  dealQuery:IDeal
};

type State = {
  paymentsData: IPaymentsData;
  checkOwnerScore: number | null
};

const scoreCampaignQuery = `
  query checkOwnerScore($ownerId: String, $ownerType: String, $campaignId: String) {
    checkOwnerScore(ownerId: $ownerId, ownerType: $ownerType, campaignId: $campaignId)
  }
`

const OwnerScoreCampaignScore = ({type,dealQuery, onScoreFetched}:{type:any,dealQuery:IDeal, onScoreFetched: (score: number) => void}) =>{
  if(!type?.scoreCampaignId || !(dealQuery?.customers ||[])?.length){
    return null
  }

  const [customer] = dealQuery.customers || []

  const {data} = useQuery(gql(scoreCampaignQuery),{variables:{ownerType:"customer",ownerId:customer._id,campaignId:type.scoreCampaignId}})

  const {checkOwnerScore} = data || {}

  React.useEffect(() => {
    if (checkOwnerScore) {
      onScoreFetched(checkOwnerScore);
    }
  }, [checkOwnerScore, onScoreFetched]);

  return <div>
    {`/Avaible score campaign score: ${checkOwnerScore}/`}
  </div>

}

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
    return Object.keys(value).map(key => (
      <div key={key}>
        {this.renderAmount(value[key])} <b>{key}</b>
      </div>
    ));
  }

  paymentStateChange = (kind: string, name: string, value: string | number) => {
    const { onChangePaymentsData, calcChangePay } = this.props;
    const { paymentsData } = this.state;

    const newPaymentData = { ...paymentsData, [name]: { ...paymentsData[name], [kind]: value } }

    onChangePaymentsData(newPaymentData);
    this.setState({ paymentsData: newPaymentData }, () => {
      calcChangePay();
    });
  };

  selectOption = option => (
    <div className='simple-option' key={option.label}>
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

    const onChange = e => {
      if (
        (!paymentsData[NAME] || !paymentsData[NAME].currency) &&
        currencies.length > 0
      ) {
        this.paymentStateChange('currency', NAME, currencies[0]);
      }

      this.paymentStateChange(
        'amount',
        NAME,
        parseFloat((e.target as HTMLInputElement).value || '0'),
      );
    };

    const currencyOnChange = currency => {
      this.paymentStateChange('currency', NAME, currency ? currency.value : '');
    };

    const onClick = () => {
      Object.keys(changePayData).forEach(key => {
        if (
          changePayData[key] > 0 &&
          (!paymentsData[NAME] || !paymentsData[NAME].amount)
        ) {
          if (!paymentsData[NAME]) {
            paymentsData[NAME] = {};
          }

          paymentsData[NAME].amount = changePayData[key];
          paymentsData[NAME].currency = key;

          changePayData[key] = 0;

          this.setState({ paymentsData });

          this.props.onChangePaymentsData(paymentsData);

          return;
        }
      });
    };

    const Option = props => {
      return (
        <components.Option {...props} key={type}>
          {this.selectOption(props.data)}
        </components.Option>
      );
    };

    const selectOptions = selectConfigOptions(currencies, CURRENCIES);

    return (
      <Flex key={type.name}>
        <ContentColumn>
          <ControlLabel>{__(type.title)}</ControlLabel>
        <OwnerScoreCampaignScore type={type} dealQuery={this.props.dealQuery} onScoreFetched={this.handleScoreFetched}/>
        </ContentColumn>

        <ContentColumn>
          <FormControl
            value={paymentsData[NAME] ? paymentsData[NAME].amount : ''}
            type='number'
            placeholder={__('Type amount')}
            min={0}
            name={NAME}
            onChange={onChange}
            onClick={onClick}
          />
        </ContentColumn>
        <ContentColumn>
          <Select
            name={type.name}
            placeholder={__('Choose currency')}
            value={selectOptions.find(
              option =>
                option.value ===
                (paymentsData[NAME] ? paymentsData[NAME].currency : 0),
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
      ...PAYMENT_TYPES.map(t => t.type),
      ...pipelinePayments.map(paymentType => paymentType.type)
    ];
    const alreadyNotExistsTypes = Object.keys(this.props.payments || {}).filter(
      name => !keys.includes(name)
    ).map(name => ({ type: name, title: name }));

    return [...PAYMENT_TYPES, ...pipelinePayments, ...alreadyNotExistsTypes].map(type => (
      this.renderPaymentsByType(type)
    ));
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
        {pluginsOfPaymentForm(type => this.renderPaymentsByType(type))}
      </>
    );
  }
}

export default PaymentForm;
