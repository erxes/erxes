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
import { Description, Footer, ScrollContent, TopContent } from './styles';

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

  save = e => {
    e.preventDefault();

    const { save } = this.props;
    const { name, brand, language } = this.state;

    save(
      {
        name,
        brandId: brand,
        languageCode: language
      },
      this.clearInput.bind(this)
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
          <ControlLabel>Default Language</ControlLabel>

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
        <ScrollContent>
          <TopContent>
            <img src="/images/icons/erxes-12.svg" />
            <h2>Create your messenger</h2>
          </TopContent>
          {this.renderContent()}
        </ScrollContent>
        <Footer>
          <Button btnStyle="link">Back</Button>
          <Button btnStyle="primary" type="submit">
            Next <Icon icon="rightarrow" />
          </Button>
        </Footer>
      </form>
    );
  }
}

export default MessengerAdd;
