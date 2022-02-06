import Button from 'modules/common/components/Button';
import { FormControl } from 'modules/common/components/form';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import { ColorPick, ColorPicker } from 'modules/settings/styles';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import { Title } from 'modules/common/styles/main';
import { __, uploadHandler, readFile } from 'modules/common/utils';
import Wrapper from 'modules/layout/components/Wrapper';
import React from 'react';
import Popover from 'react-bootstrap/Popover';
import TwitterPicker from 'react-color/lib/Twitter';
import { ContentBox } from '../../styles';
import { KEY_LABELS } from '../constants';
import { IConfigsMap } from '../types';
import Header from './Header';
import Sidebar from '../containers/Sidebar';

type Props = {
  save: (configsMap: IConfigsMap) => void;
  configsMap: IConfigsMap;
};

type State = {
  configsMap: IConfigsMap;
  isSaved: boolean;
};

class GeneralSettings extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      configsMap: props.configsMap,
      isSaved: false
    };
  }

  save = e => {
    e.preventDefault();

    const { configsMap } = this.state;

    this.setState({ isSaved: true });

    this.props.save(configsMap);
  };

  onChangeConfig = (code: string, value) => {
    const { configsMap } = this.state;

    configsMap[code] = value;

    this.setState({ configsMap });
  };

  onChangeInput = (code: string, e) => {
    this.onChangeConfig(code, e.target.value);
  };

  renderItem = (key: string, description?: string, componentClass?: string) => {
    const { configsMap } = this.state;

    return (
      <FormGroup>
        <ControlLabel>{KEY_LABELS[key]}</ControlLabel>

        {description && <p>{__(description)}</p>}

        <FormControl
          componentClass={componentClass}
          defaultValue={configsMap[key]}
          onChange={this.onChangeInput.bind(this, key)}
        />
      </FormGroup>
    );
  };

  onChangeColor = (field, e) => {
    this.onChangeConfig(field, e.hex);
  };

  renderColorPicker = field => {
    const { configsMap } = this.state;
    const value = configsMap[field];

    const popoverContent = (
      <Popover id="color-picker">
        <TwitterPicker
          color={value}
          onChange={this.onChangeColor.bind(this, field)}
          triangle="hide"
        />
      </Popover>
    );

    return (
      <OverlayTrigger
        trigger="click"
        rootClose={true}
        placement="bottom-start"
        overlay={popoverContent}
      >
        <ColorPick>
          <ColorPicker style={{ backgroundColor: value }} />
        </ColorPick>
      </OverlayTrigger>
    );
  };

  handleLogoChange = (field, e) => {
    const imageFile = e.target.files;

    uploadHandler({
      files: imageFile,

      beforeUpload: () => {
        return;
      },

      afterUpload: ({ response }) => {
        this.onChangeConfig(field, response);
      },

      afterRead: ({ result }) => {
        return;
      }
    });
  };

  renderUploadImage(field, description?) {
    const { configsMap } = this.state;
    const value = configsMap[field];

    return (
      <FormGroup>
        <ControlLabel>{KEY_LABELS[field]}</ControlLabel>
        {description && <p>{__(description)}</p>}
        {value ? (
          <p>
            <img alt={field} src={readFile(value)} />
          </p>
        ) : null}
        <input type="file" onChange={this.handleLogoChange.bind(this, field)} />
      </FormGroup>
    );
  }

  render() {
    const breadcrumb = [
      { title: __('Settings'), link: '/settings' },
      { title: __('Theme config') }
    ];

    const actionButtons = (
      <Button btnStyle="success" onClick={this.save} icon="check-circle">
        Save
      </Button>
    );

    const content = (
      <ContentBox>
        {this.renderUploadImage(
          'THEME_LOGO',
          'Transparent PNG, around 3:1 aspect ratio. Max width: 600px.'
        )}
        {this.renderUploadImage('THEME_FAVICON', '16x16px transparent PNG.')}

        {this.renderItem('THEME_LOGIN_PAGE_DESCRIPTION', '', 'textarea')}

        <FormGroup>
          <ControlLabel>{KEY_LABELS.THEME_TEXT_COLOR}</ControlLabel>
          <p>{__('Used on the login page text')}</p>
          {this.renderColorPicker('THEME_TEXT_COLOR')}
        </FormGroup>

        <FormGroup>
          <ControlLabel>{KEY_LABELS.THEME_BACKGROUND}</ControlLabel>
          <p>{__('Used on the login background')}</p>
          {this.renderColorPicker('THEME_BACKGROUND')}
        </FormGroup>
      </ContentBox>
    );

    return (
      <Wrapper
        header={
          <Wrapper.Header title={__('Theme config')} breadcrumb={breadcrumb} />
        }
        mainHead={<Header />}
        actionBar={
          <Wrapper.ActionBar
            left={<Title>{__('Theme config')}</Title>}
            right={actionButtons}
          />
        }
        leftSidebar={<Sidebar />}
        content={content}
      />
    );
  }
}

export default GeneralSettings;
