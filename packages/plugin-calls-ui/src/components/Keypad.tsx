import Icon from '@erxes/ui/src/components/Icon';
import Button from '@erxes/ui/src/components/Button';
import { __ } from '@erxes/ui/src/utils';
import React from 'react';
import {
  InputBar,
  NumberInput,
  CountryCode,
  BackIcon,
  ChooseCountry,
  Country,
  Keypad,
  CountryContainer
} from '../styles';
import { countryNumbers, ourPhone, numbers, symbols } from '../constants';
import { FormControl } from '@erxes/ui/src/components/form';
import Select from 'react-select-plus';

type Props = {
  history?: any;
};

type State = {
  chosenCountry: any;
  number: string;
  showTrigger: boolean;
  searchValue: string;
  callFrom: any;
};

class KeyPad extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      chosenCountry: countryNumbers[0],
      number: '',
      searchValue: '',
      showTrigger: false,
      callFrom: '+976 7777 7777'
    };
  }

  handNumPad = e => {
    const { number } = this.state;

    let num = number;

    if (e === 'delete') {
      num = number.slice(0, -1);
      this.setState({ number: num });
    } else {
      num += e;
      this.setState({ number: num });
    }
  };

  renderKeyPad = () => {
    return (
      <Keypad>
        {numbers.map(n => (
          <div className="number" key={n} onClick={() => this.handNumPad(n)}>
            {n}
          </div>
        ))}
        <div className="symbols">
          {symbols.map(s => (
            <div
              key={s.class}
              className={s.class}
              onClick={() => this.handNumPad(s.symbol)}
            >
              {s.toShow || s.symbol}
            </div>
          ))}
        </div>
        <div className="number" onClick={() => this.handNumPad(0)}>
          0
        </div>
        <div className="symbols" onClick={() => this.handNumPad('delete')}>
          <Icon icon="backspace" />
        </div>
      </Keypad>
    );
  };

  render() {
    const {
      chosenCountry,
      number,
      showTrigger,
      searchValue,
      callFrom
    } = this.state;

    const onBack = () => this.setState({ showTrigger: false });
    const onTrigger = () => this.setState({ showTrigger: true });
    const onCountryChange = country => {
      this.setState({ chosenCountry: country });
      this.setState({ showTrigger: false });
    };

    const search = e => {
      const inputValue = e.target.value;
      this.setState({ searchValue: inputValue });
    };

    const onStatusChange = (status: { label: string; value: boolean }) => {
      this.setState({ callFrom: status.value });
    };

    if (showTrigger) {
      return (
        <ChooseCountry>
          <BackIcon onClick={onBack}>
            <Icon icon="angle-left" size={20} /> {__('Back')}
          </BackIcon>
          <InputBar type="country">
            <Icon icon="search-1" size={20} />
            <FormControl
              placeholder={__('Search')}
              name="searchValue"
              onChange={search}
              value={searchValue}
              autoFocus={true}
            />
          </InputBar>
          <CountryContainer>
            {countryNumbers.map(c => {
              return (
                <Country key={c.code} onClick={() => onCountryChange(c)}>
                  <CountryCode>
                    <img src={c.flag} />
                    {c.code}
                  </CountryCode>
                  {c.country}
                </Country>
              );
            })}
          </CountryContainer>
        </ChooseCountry>
      );
    }

    return (
      <NumberInput>
        <InputBar type="keypad">
          <CountryCode onClick={onTrigger}>
            <img src={chosenCountry.flag} />
            {chosenCountry.code}
            <Icon icon="downarrow-2" size={8} />
          </CountryCode>
          <FormControl
            placeholder={__('Enter Phone Number')}
            name="searchValue"
            value={number}
            disabled={true}
            autoFocus={true}
          />
        </InputBar>
        {this.renderKeyPad()}
        <p>Calling from your own phone number</p>
        <Select
          placeholder={__('Choose phone number')}
          value={callFrom}
          onChange={onStatusChange}
          clearable={false}
          options={ourPhone}
          scrollMenuIntoView={true}
        />
        <Button icon="outgoing-call">Call</Button>
      </NumberInput>
    );
  }
}

export default KeyPad;
