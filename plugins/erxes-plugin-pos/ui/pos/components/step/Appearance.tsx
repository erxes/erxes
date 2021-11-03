import { ControlLabel } from 'modules/common/components/form';
import { LeftItem } from 'erxes-ui/lib/components/step/styles';
import { __, uploadHandler, FormGroup } from 'erxes-ui';
import React from 'react';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';
import TwitterPicker from 'react-color/lib/Twitter';
import {
  AppearanceRow,
  ColorPick,
  ColorPicker,
  FlexItem,
  SubItem
} from '../../../styles';

interface IColor {
  [key: string]: string;
}

export interface IUIOptions {
  colors: IColor;
  logo: string;
  bgImage: string;
}

type Props = {
  onChange: (
    name: 'uiOptions' | 'logoPreviewUrl' | 'logoPreviewStyle',
    value: any
  ) => void;
  uiOptions?: IUIOptions;
  logoPreviewUrl: string;
};

type State = {
  uiOptions: IUIOptions;
};

class Appearance extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    const uiOptions = props.uiOptions || {};

    this.state = { uiOptions };
  }

  onChangeFunction = (name: any, value: any) => {
    this.props.onChange(name, value);
  };

  onChangeAppearance = (name: any, value: any) => {
    this.props.onChangeAppearance(name, value);
  };

  handleLogoChange = e => {
    const { uiOptions } = this.props;
    const imageFile = e.target.files;

    const key = e.target.id;

    uploadHandler({
      files: imageFile,

      beforeUpload: () => {
        this.onChangeFunction('logoPreviewStyle', { opacity: '0.7' });
      },

      afterUpload: ({ response }) => {
        uiOptions[key] = response;
        this.onChangeFunction('uiOptions', uiOptions);
        this.onChangeFunction('logoPreviewStyle', { opacity: '1' });
      },

      afterRead: ({ result }) => {
        this.onChangeFunction('logoPreviewUrl', result);
      }
    });
  };

  renderUploadImage(id, title) {
    const { uiOptions } = this.state;

    return (
      <SubItem>
        <ControlLabel>{title}</ControlLabel>
        <img src={uiOptions[id]} alt={id} />
        <input id={id} type="file" onChange={this.handleLogoChange} />
      </SubItem>
    );
  }

  renderPicker(group, key, title) {
    const { uiOptions } = this.props;
    const color = uiOptions[group][key] || '';

    const onChangeColor = e => {
      uiOptions[group][key] = e.hex;

      this.onChangeFunction('uiOptions', uiOptions);
    };

    const popoverContent = (
      <Popover id={key}>
        <TwitterPicker color={color} onChange={onChangeColor} triangle="hide" />
      </Popover>
    );

    return (
      <SubItem>
        <label>{title}</label>
        <OverlayTrigger
          trigger="click"
          rootClose={true}
          placement="bottom-start"
          overlay={popoverContent}
        >
          <ColorPick>
            <ColorPicker style={{ backgroundColor: color }} />
          </ColorPick>
        </OverlayTrigger>
      </SubItem>
    );
  }

  render() {
    return (
      <FlexItem>
        <LeftItem>
          <AppearanceRow>
            {this.renderUploadImage('logo', __('Logo'))}
            {this.renderUploadImage('bgImage', __('Background Image'))}
          </AppearanceRow>
          <FormGroup>
            <ControlLabel>{__('Colors')}</ControlLabel>
            <AppearanceRow>
              {this.renderPicker('colors', 'primary', 'Primary')}
              {this.renderPicker('colors', 'secondary', 'Secondary')}
            </AppearanceRow>
          </FormGroup>
        </LeftItem>
      </FlexItem>
    );
  }
}

export default Appearance;
