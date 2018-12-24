import {
  Button,
  ControlLabel,
  FormControl,
  FormGroup,
  Icon
} from 'modules/common/components';
import * as React from 'react';
import * as RTG from 'react-transition-group';
import { BrandList } from '../containers';
import { Description, Footer, ScrollContent, TopContent } from './styles';

type Props = {
  brandsTotalCount: number;
  save: (name: string, callback: () => void) => void;
};

class BrandForm extends React.Component<
  Props,
  { brandName: string; showBrands: boolean }
> {
  constructor(props: Props) {
    super(props);

    this.state = { showBrands: false, brandName: '' };
  }

  clearInput() {
    this.setState({ brandName: '' });
  }

  toggleBrands = () => {
    this.setState({ showBrands: !this.state.showBrands });
  };

  save = e => {
    e.preventDefault();
    const { save } = this.props;

    save(this.state.brandName, this.clearInput.bind(this));
  };

  handleInput = e => {
    e.preventDefault();
    this.setState({ brandName: e.target.value });
  };

  renderContent() {
    const { brandName, showBrands } = this.state;

    return (
      <>
        <FormGroup>
          <ControlLabel>Brand name</ControlLabel>

          <FormControl
            value={brandName}
            onChange={this.handleInput}
            type="text"
            required={true}
          />
        </FormGroup>

        <Description>
          <Icon icon="information" /> You already have a{' '}
          <b>{this.props.brandsTotalCount}</b> brands.
          <a href="javascript:;" onClick={this.toggleBrands}>
            {' '}
            {showBrands ? 'Hide' : 'Show'} ›
          </a>
        </Description>

        <RTG.CSSTransition
          in={showBrands}
          appear={true}
          timeout={300}
          classNames="slide-in"
          unmountOnExit={true}
        >
          <BrandList queryParams={{}} />
        </RTG.CSSTransition>
      </>
    );
  }

  render() {
    return (
      <form onSubmit={this.save}>
        <ScrollContent>
          <TopContent>
            <img src="/images/icons/erxes-03.svg" />
            <h2>Create your brand </h2>
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

export default BrandForm;
