import classnames from 'classnames';
import { TEXT_COLORS } from '@erxes/ui-cards/src/boards/constants';
import { ControlLabel } from '@erxes/ui/src/components/form';
import { FlexItem, LeftItem } from '@erxes/ui/src/components/step/styles';
import { __, uploadHandler } from 'coreui/utils';
import {
  BackgroundSelector,
  SubItem,
  WidgetBackgrounds
} from '@erxes/ui-settings/src/styles';
import { ColorPick, ColorPicker } from '@erxes/ui/src/styles/main';
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
      | 'color'
      | 'textColor',
    value: string
  ) => void;
  color: string;
  textColor: string;
  logoPreviewUrl?: string;
  wallpaper: string;
};

type State = {
  wallpaper: string;
  logoPreviewStyle: any;
  logo: object;
  logoPreviewUrl: object;
};

class Appearance extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      wallpaper: props.wallpaper,
      logoPreviewStyle: {},
      logo: {},
      logoPreviewUrl: {}
    };
  }

  onChange = <T extends keyof State>(name: T, value: State[T]) => {
    this.props.onChange(name, value);
    this.setState(({ [name]: value } as unknown) as Pick<State, keyof State>);
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
        style={{ borderColor: isSelected ? this.props.color : 'transparent' }}
      >
        <div className={`background-${value}`} />
      </BackgroundSelector>
    );
  }

  renderUploadImage(title) {
    return (
      <SubItem>
        <ControlLabel>{title}</ControlLabel>
        <input
          type="file"
          accept="image/png, image/jpeg"
          onChange={this.handleLogoChange}
        />
      </SubItem>
    );
  }

  render() {
    const { color, textColor, onChange } = this.props;
    const onChangeColor = (key, e) => onChange(key, e.hex);

    const popoverContent = (
      <Popover id="color-picker">
        <TwitterPicker
          color={color}
          onChange={onChangeColor.bind(this, 'color')}
          triangle="hide"
        />
      </Popover>
    );

    const textColorContent = (
      <Popover id="text-color-picker">
        <TwitterPicker
          color={textColor}
          onChange={onChangeColor.bind(this, 'textColor')}
          colors={TEXT_COLORS}
          triangle="hide"
        />
      </Popover>
    );

    return (
      <FlexItem>
        <LeftItem>
          <SubItem>
            <ControlLabel>{__('Choose a background color')}</ControlLabel>
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
          <SubItem>
            <ControlLabel>{__('Choose a text color')}</ControlLabel>
            <OverlayTrigger
              trigger="click"
              rootClose={true}
              placement="bottom-start"
              overlay={textColorContent}
            >
              <ColorPick>
                <ColorPicker style={{ backgroundColor: textColor }} />
              </ColorPick>
            </OverlayTrigger>
          </SubItem>

          <SubItem>
            <ControlLabel>Choose a wallpaper</ControlLabel>

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
