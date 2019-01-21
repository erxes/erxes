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
import { Description, Footer, TopContent } from './styles';

type Props = {
  brandsTotalCount: number;
  save: (name: string, callback: () => void) => void;
  changeStep: () => void;
};

class BrandAdd extends React.Component<
  Props,
  { brandName: string; showBrands: boolean }
> {
  constructor(props: Props) {
    super(props);

    this.state = { showBrands: true, brandName: '' };
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

  next = e => {
    e.preventDefault();
    const { changeStep, save } = this.props;
    save(this.state.brandName, changeStep);
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
          <Icon icon="information" /> You already have{' '}
          <b>{this.props.brandsTotalCount}</b> brands.{' '}
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
          <BrandList queryParams={{}} />
        </RTG.CSSTransition>
      </>
    );
  }

  render() {
    const { brandsTotalCount } = this.props;

    return (
      <form onSubmit={this.save}>
        <TopContent>
          <h2>Create your brand </h2>
          {this.renderContent()}
        </TopContent>
        <Footer>
          <div>
            <Button btnStyle="link" disabled={true}>
              Previous
            </Button>
            <Button btnStyle="success" onClick={this.next}>
              Next <Icon icon="rightarrow-2" />
            </Button>
          </div>
          <a onClick={this.props.changeStep}>Skip for now</a>
        </Footer>
      </form>
    );
  }
}

export default BrandAdd;
