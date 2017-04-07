import React, { PropTypes, Component } from 'react';
import { FlowRouter } from 'meteor/kadira:flow-router';
import {
  FormGroup,
  ControlLabel,
  FormControl,
  Radio,
  Button,
  ButtonGroup,
} from 'react-bootstrap';
import { Wrapper } from '/imports/react-ui/layout/components';
import Sidebar from '../../Sidebar.jsx';

class Appearance extends Component {
  constructor(props) {
    super(props);

    this.state = {
      color: props.prevOptions.color || '#452679',
      wallpaper: props.prevOptions.wallpaper || '1',
    };

    this.save = this.save.bind(this);
    this.onColorChange = this.onColorChange.bind(this);
    this.onWallpaperChange = this.onWallpaperChange.bind(this);
  }

  onColorChange(e) {
    this.setState({ color: e.target.value });
  }

  onWallpaperChange(e) {
    this.setState({ wallpaper: e.target.value });
  }

  save(e) {
    e.preventDefault();

    this.props.save(this.state);
  }

  renderWallpaperRadio(value) {
    return (
      <Radio
        onChange={this.onWallpaperChange}
        name="wallpaper"
        value={value}
        checked={this.state.wallpaper === value}
        inline
      >

        {value}
      </Radio>
    );
  }

  render() {
    const content = (
      <div className="margined">
        <FormGroup>
          <ControlLabel>Choose a custom color</ControlLabel>
          <FormControl
            name="color"
            type="color"
            value={this.state.color}
            onChange={this.onColorChange}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Choose a wallpaper</ControlLabel>

          <div>
            {this.renderWallpaperRadio('1')}
            {this.renderWallpaperRadio('2')}
            {this.renderWallpaperRadio('3')}
            {this.renderWallpaperRadio('4')}
          </div>
        </FormGroup>
      </div>
    );

    const breadcrumb = [
      { title: 'Settings', link: '/settings/integrations' },
      { title: 'Integrations' },
    ];

    const actionBar = (
      <Wrapper.ActionBar
        left={
          <ButtonGroup>
            <Button bsStyle="link" onClick={this.save}>
              <i className="ion-checkmark-circled" /> Save
            </Button>

            <Button bsStyle="link" href={FlowRouter.path('/settings/integrations')}>
              <i className="ion-close-circled" /> Cancel
            </Button>
          </ButtonGroup>
        }
      />
    );

    return (
      <div>
        <Wrapper
          header={<Wrapper.Header breadcrumb={breadcrumb} />}
          leftSidebar={<Sidebar />}
          actionBar={actionBar}
          content={content}
        />
      </div>
    );
  }
}

Appearance.propTypes = {
  prevOptions: PropTypes.object.isRequired, // eslint-disable-line
  save: PropTypes.func.isRequired,
};

export default Appearance;
