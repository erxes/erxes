import Button from 'modules/common/components/Button';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import HeaderDescription from 'modules/common/components/HeaderDescription';
import CURRENCIES from 'modules/common/constants/currencies';
import { __ } from 'modules/common/utils';
import ActionBar from 'modules/layout/components/ActionBar';
import Wrapper from 'modules/layout/components/Wrapper';
import React from 'react';
import { Link } from 'react-router-dom';
import Select from 'react-select-plus';
import { ContentBox } from '../../styles';
import { LANGUAGES, MEASUREMENTS } from '../constants';

type Props = {
  currentLanguage: string;
  changeLanguage: (language: string) => void;
  save: (name: string, object: any) => void;
  // TODO: check currencies type
  currencies: string[];
  uom: string[];
};

type State = {
  currencies: string[];
  uom: string[];
  language: string;
  removeSelected: boolean;
};

class List extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      currencies: props.currencies,
      uom: props.uom,
      language: props.currentLanguage,
      removeSelected: false
    };
  }

  save = e => {
    e.preventDefault();

    const { currencies, uom, language } = this.state;

    this.props.save('dealCurrency', currencies);
    this.props.save('dealUOM', uom);
    this.props.changeLanguage(language);
  };

  onCurrenciesChange = currencies => {
    this.setState({ currencies: currencies.map(el => el.value) });
  };

  onUOMChange = uom => {
    this.setState({ uom: uom.map(el => el.value) });
  };

  onLanguageChange = language => {
    this.setState({ language: language.value });
  };

  render() {
    const breadcrumb = [
      { title: __('Settings'), link: '/settings' },
      { title: __('General') }
    ];

    const actionFooter = (
      <ActionBar
        right={
          <Button.Group>
            <Link to="/settings/">
              <Button size="small" btnStyle="simple" icon="cancel-1">
                Cancel
              </Button>
            </Link>

            <Button
              size="small"
              btnStyle="success"
              onClick={this.save}
              icon="checked-1"
            >
              Save
            </Button>
          </Button.Group>
        }
      />
    );

    const content = (
      <ContentBox>
        <FormGroup>
          <ControlLabel>Language</ControlLabel>
          <Select
            options={LANGUAGES}
            value={this.state.language}
            onChange={this.onLanguageChange}
            searchable={false}
            clearable={false}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>Currency</ControlLabel>
          <Select
            options={CURRENCIES}
            value={this.state.currencies}
            removeSelected={this.state.removeSelected}
            onChange={this.onCurrenciesChange}
            multi={true}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Unit of measurement</ControlLabel>
          <Select
            options={MEASUREMENTS}
            value={this.state.uom}
            removeSelected={this.state.removeSelected}
            onChange={this.onUOMChange}
            multi={true}
          />
        </FormGroup>
      </ContentBox>
    );

    return (
      <Wrapper
        header={
          <Wrapper.Header title={__('General')} breadcrumb={breadcrumb} />
        }
        actionBar={
          <Wrapper.ActionBar
            left={
              <HeaderDescription
                icon="/images/actions/25.svg"
                title="General"
                description="Set up your initial account settings so that things run smoothly in unison."
              />
            }
          />
        }
        content={content}
        footer={actionFooter}
        center={true}
      />
    );
  }
}

export default List;
