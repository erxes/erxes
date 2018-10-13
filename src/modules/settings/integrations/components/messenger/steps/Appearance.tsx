import classnames from 'classnames';
import { FlexItem, LeftItem } from 'modules/common/components/step/styles';
import { __, uploadHandler } from 'modules/common/utils';
import {
  BackgroundSelector,
  ColorPick,
  ColorPicker,
  SubHeading,
  SubItem,
  WidgetBackgrounds
} from 'modules/settings/styles';
import * as React from 'react';
import { OverlayTrigger, Popover } from 'react-bootstrap';
import { ChromePicker } from 'react-color';

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

    this.onChange = this.onChange.bind(this);
    this.handleLogoChange = this.handleLogoChange.bind(this);
  }

  onChange<T extends keyof State>(name: T, value: State[T]) {
    this.props.onChange(name, value);
    this.setState({ [name]: value } as Pick<State, keyof State>);
  }

  handleLogoChange(e) {
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
  }

  renderWallpaperSelect(value) {
    const isSelected = this.state.wallpaper === value;
    const selectorClass = classnames({ selected: isSelected });

    return (
      <BackgroundSelector
        className={selectorClass}
        onClick={() => this.onChange('wallpaper', value)}
        style={{ borderColor: isSelected ? this.state.color : 'transparent' }}
      >
        <div className={`background-${value}`} />
      </BackgroundSelector>
    );
  }

  renderUploadImage(title) {
    return (
      <SubItem>
        <SubHeading>{title}</SubHeading>
        <input type="file" onChange={this.handleLogoChange} />
      </SubItem>
    );
  }

  render() {
    const popoverTop = (
      <Popover id="color-picker">
        <ChromePicker
          color={this.state.color}
          onChange={e => this.onChange('color', e.hex)}
        />
      </Popover>
    );

    return (
      <FlexItem>
        <LeftItem>
          <SubItem>
            <SubHeading>{__('Choose a custom color')}</SubHeading>
            <OverlayTrigger
              trigger="click"
              rootClose
              placement="bottom"
              overlay={popoverTop}
            >
              <ColorPick>
                <ColorPicker style={{ backgroundColor: this.state.color }} />
              </ColorPick>
            </OverlayTrigger>
          </SubItem>

          <SubItem>
            <SubHeading>{__('Choose a wallpaper')}</SubHeading>

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
