import classnames from 'classnames';
import { ControlLabel } from 'modules/common/components/form';
import { FlexItem, LeftItem } from 'modules/common/components/step/styles';
import { __, uploadHandler } from 'modules/common/utils';
import {
  BackgroundSelector,
  ColorPick,
  ColorPicker,
  SubItem,
  WidgetBackgrounds
} from 'modules/settings/styles';
import React from 'react';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';
import TwitterPicker from 'react-color/lib/Twitter';

type Props = {
  onChange: (
    name:
      | 'logoPreviewStyle'
      | 'logo'
      | 'logoPreviewUrl'
      | 'wallpaper'
      | 'color',
    value: string
  ) => void;
  color: string;
  logoPreviewUrl?: string;
  wallpaper: string;
};

type State = {
  color: string;
  wallpaper: string;
  logoPreviewStyle: any;
  logo: object;
  logoPreviewUrl: object;
};

class Appearance extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      color: props.color,
      wallpaper: props.wallpaper,
      logoPreviewStyle: {},
      logo: {},
      logoPreviewUrl: {}
    };
  }

  onChange = <T extends keyof State>(name: T, value: State[T]) => {
    this.props.onChange(name, value);
    this.setState({ [name]: value } as Pick<State, keyof State>);
  };

  handleLogoChange = e => {
    const imageFile = e.target.files;

    uploadHandler({
      files: imageFile,

      beforeUpload: () => {
        this.onChange('logoPreviewStyle', { opacity: '0.7' });
      },

      afterUpload: ({ response }) => {
        this.onChange('logo', response);
        this.onChange('logoPreviewStyle', { opacity: '1' });
      },

      afterRead: ({ result }) => {
        this.onChange('logoPreviewUrl', result);
      }
    });
  };

  renderWallpaperSelect(value) {
    const isSelected = this.state.wallpaper === value;
    const selectorClass = classnames({ selected: isSelected });

    const onClick = () => this.onChange('wallpaper', value);

    return (
      <BackgroundSelector
        className={selectorClass}
        onClick={onClick}
        style={{ borderColor: isSelected ? this.state.color : 'transparent' }}
      >
        <div className={`background-${value}`} />
      </BackgroundSelector>
    );
  }

  renderUploadImage(title) {
    return (
      <SubItem>
        <ControlLabel>{title}</ControlLabel>
        <input type="file" onChange={this.handleLogoChange} />
      </SubItem>
    );
  }

  render() {
    const onChange = e => this.onChange('color', e.hex);

    const popoverContent = (
      <Popover id="color-picker">
        <TwitterPicker color={this.state.color} onChange={onChange} />
      </Popover>
    );

    return (
      <FlexItem>
        <LeftItem>
          <SubItem>
            <ControlLabel>{__('Choose a custom color')}</ControlLabel>
            <OverlayTrigger
              trigger="click"
              rootClose={true}
              placement="bottom-start"
              overlay={popoverContent}
            >
              <ColorPick>
                <ColorPicker style={{ backgroundColor: this.state.color }} />
              </ColorPick>
            </OverlayTrigger>
          </SubItem>

          <SubItem>
            <ControlLabel>{__('Choose a wallpaper')}</ControlLabel>

            <WidgetBackgrounds>
              {this.renderWallpaperSelect('1')}
              {this.renderWallpaperSelect('2')}
              {this.renderWallpaperSelect('3')}
              {this.renderWallpaperSelect('4')}
              {this.renderWallpaperSelect('5')}
            </WidgetBackgrounds>
          </SubItem>

          {this.renderUploadImage(__('Choose a logo'))}
        </LeftItem>
      </FlexItem>
    );
  }
}

export default Appearance;
