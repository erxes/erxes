import {
  Button,
  ControlLabel,
  FormControl,
  FormGroup,
  Icon
} from 'modules/common/components';
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
  showBrands: boolean;
};

class MessengerAdd extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = { showBrands: true, name: '', brand: '', language: '' };
  }

  clearInput() {
    this.setState({ name: '' });
  }

  toggleBrands = () => {
    this.setState({ showBrands: !this.state.showBrands });
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

  renderContent() {
    const { name, showBrands } = this.state;

    return (
      <>
        <FormGroup>
          <ControlLabel>Messenger name</ControlLabel>

          <FormControl
            value={name}
            onChange={this.handleChange.bind(this, 'name')}
            type="text"
            required={true}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Messenger Language</ControlLabel>

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

        <Description>
          <Icon icon="information" /> You already have{' '}
          <b>{this.props.totalCount}</b> messengers.
          <a href="javascript:;" onClick={this.toggleBrands}>
            {showBrands ? 'Hide' : 'Show'} ›
          </a>
        </Description>

        <RTG.CSSTransition
          in={showBrands}
          appear={true}
          timeout={300}
          classNames="slide"
          unmountOnExit={true}
        >
          <MessengerList />
        </RTG.CSSTransition>
      </>
    );
  }

  render() {
    return (
      <form onSubmit={this.save}>
        <TopContent>
          <h2>Create your messenger</h2>
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
              Next <Icon icon="rightarrow-2" />
            </Button>
          </div>
          <a onClick={this.goNext}>Skip for now »</a>
        </Footer>
      </form>
    );
  }
}

export default MessengerAdd;
