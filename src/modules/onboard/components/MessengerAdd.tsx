import {
  Button,
  ControlLabel,
  FormControl,
  FormGroup,
  Icon
} from 'modules/common/components';
import { __ } from 'modules/common/utils';
import { IBrand } from 'modules/settings/brands/types';
import { LANGUAGES } from 'modules/settings/general/constants';
import { SelectBrand } from 'modules/settings/integrations/components';
import * as React from 'react';
import * as RTG from 'react-transition-group';
import { MessengerList } from '../containers';
import { Description, Footer, TopContent } from './styles';

type Props = {
  brands: IBrand[];
  totalCount: number;
  save: (
    params: {
      name: string;
      brandId: string;
      languageCode: string;
    },
    callback: () => void
  ) => void;
  changeStep: (increase: boolean) => void;
};

type State = {
  name: string;
  language: string;
  brand: string;
  showMessengers: boolean;
};

class MessengerAdd extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = { showMessengers: true, name: '', brand: '', language: '' };
  }

  clearInput() {
    this.setState({ name: '' });
  }

  toggleMessengers = () => {
    this.setState({ showMessengers: !this.state.showMessengers });
  };

  goNext = () => {
    this.props.changeStep(true);
  };

  save = e => {
    e.preventDefault();
    const { name, brand, language } = this.state;

    this.props.save(
      {
        name,
        brandId: brand,
        languageCode: language
      },
      this.clearInput.bind(this)
    );
  };

  saveNext = e => {
    e.preventDefault();
    const { name, brand, language } = this.state;

    this.props.save(
      {
        name,
        brandId: brand,
        languageCode: language
      },
      this.goNext
    );
  };

  handleChange = <T extends keyof State>(name: T, e) => {
    e.preventDefault();
    this.setState({ [name]: e.target.value } as Pick<State, keyof State>);
  };

  renderOtherMessengers = () => {
    const { totalCount } = this.props;

    if (totalCount === 0) {
      return null;
    }

    const { showMessengers } = this.state;

    return (
      <>
        <Description>
          <Icon icon="checked-1" /> {__('You already have')} <b>{totalCount}</b>{' '}
          {__('messengers')}.
          <a href="javascript:;" onClick={this.toggleMessengers}>
            {showMessengers ? __('Show') : __('Hide')} ›
          </a>
        </Description>

        <RTG.CSSTransition
          in={showMessengers}
          appear={true}
          timeout={300}
          classNames="slide-in-small"
          unmountOnExit={true}
        >
          <MessengerList />
        </RTG.CSSTransition>
      </>
    );
  };

  renderContent() {
    const { name } = this.state;

    return (
      <>
        <FormGroup>
          <ControlLabel required={true}>Messenger name</ControlLabel>

          <FormControl
            value={name}
            onChange={this.handleChange.bind(this, 'name')}
            type="text"
            required={true}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel required={true}>Messenger Language</ControlLabel>

          <FormControl
            componentClass="select"
            id="languageCode"
            onChange={this.handleChange.bind(this, 'language')}
          >
            <option />
            {LANGUAGES.map((item, index) => (
              <option key={index} value={item.value}>
                {item.label}
              </option>
            ))}
          </FormControl>
        </FormGroup>

        <SelectBrand
          brands={this.props.brands || []}
          onChange={this.handleChange.bind(this, 'brand')}
        />

        {this.renderOtherMessengers()}
      </>
    );
  }

  render() {
    return (
      <form onSubmit={this.save}>
        <TopContent>
          <h2>{__('Start messaging now!')}</h2>
          {this.renderContent()}
        </TopContent>
        <Footer>
          <div>
            <Button
              btnStyle="link"
              onClick={this.props.changeStep.bind(null, false)}
            >
              Previous
            </Button>
            <Button btnStyle="success" onClick={this.saveNext}>
              {__('Next')} <Icon icon="rightarrow-2" />
            </Button>
          </div>
          <a onClick={this.goNext}>{__('Skip for now')} »</a>
        </Footer>
      </form>
    );
  }
}

export default MessengerAdd;
