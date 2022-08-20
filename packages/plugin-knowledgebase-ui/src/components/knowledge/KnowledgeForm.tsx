import { ColorPick, ColorPicker, ModalFooter } from '@erxes/ui/src/styles/main';
import { ExpandWrapper, MarkdownWrapper } from '@erxes/ui-settings/src/styles';
import {
  IAttachment,
  IButtonMutateProps,
  IFormProps
} from '@erxes/ui/src/types';
import { __, getEnv } from 'coreui/utils';

import Button from '@erxes/ui/src/components/Button';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import CopyToClipboard from 'react-copy-to-clipboard';
import EmptyState from '@erxes/ui/src/components/EmptyState';
import { FlexContent } from '@erxes/ui/src/layout/styles';
import Form from '@erxes/ui/src/components/form/Form';
import FormControl from '@erxes/ui/src/components/form/Control';
import FormGroup from '@erxes/ui/src/components/form/Group';
import { IBrand } from '@erxes/ui/src/brands/types';
import { ITopic } from '@erxes/ui-knowledgeBase/src/types';
import Info from '@erxes/ui/src/components/Info';
import { LANGUAGES } from '@erxes/ui-settings/src/general/constants';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';
import React from 'react';
import ReactMarkdown from 'react-markdown';
import Select from 'react-select-plus';
import SelectBrand from '@erxes/ui-inbox/src/settings/integrations/containers/SelectBrand';
import TwitterPicker from 'react-color/lib/Twitter';
import Uploader from '@erxes/ui/src/components/Uploader';
import colors from '@erxes/ui/src/styles/colors';

type Props = {
  topic: ITopic;
  brands: IBrand[];
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  remove?: (knowledgeBaseId: string) => void;
  closeModal: () => void;
};

type State = {
  copied: boolean;
  tagCopied: boolean;
  code: string;
  tag: string;
  color: string;
  backgroundImage: string;
  languageCode?: string;
};

class KnowledgeForm extends React.Component<Props, State> {
  static installCodeIncludeScript() {
    const { REACT_APP_CDN_HOST } = getEnv();

    return `
      (function() {
        var script = document.createElement('script');
        script.src = "${REACT_APP_CDN_HOST}/build/knowledgebaseWidget.bundle.js";
        script.async = true;
        var entry = document.getElementsByTagName('script')[0];
        entry.parentNode.insertBefore(script, entry);
      })();
    `;
  }

  static getInstallCode(topicId) {
    return `
      <script>
        window.erxesSettings = {
          knowledgeBase: {
            topic_id: "${topicId}"
          },
        };
        ${KnowledgeForm.installCodeIncludeScript()}
      </script>
    `;
  }

  static getInstallTag() {
    return `
      <div data-erxes-kbase style="width:900px;height:300px"></div>
    `;
  }

  constructor(props: Props) {
    super(props);

    let code = '';
    let tag = '';
    let color = colors.colorPrimary;
    let backgroundImage = '';

    const { topic } = props;

    // showed install code automatically in edit mode
    if (topic) {
      code = KnowledgeForm.getInstallCode(topic._id);
      tag = KnowledgeForm.getInstallTag();
      color = topic.color;
      backgroundImage = topic.backgroundImage;
    }

    this.state = {
      copied: false,
      tagCopied: false,
      code,
      tag,
      color,
      backgroundImage,
      languageCode: topic && topic.languageCode
    };
  }

  onColorChange = e => {
    this.setState({ color: e.hex });
  };

  onCopy = (name: string) => {
    if (name === 'code') {
      return this.setState({ copied: true });
    }

    return this.setState({ tagCopied: true });
  };

  onBackgroundImageChange = ([file]: IAttachment[]) => {
    this.setState({ backgroundImage: file ? file.url : '' });
  };

  remove = () => {
    const { remove, topic } = this.props;

    if (remove) {
      remove(topic._id);
    }
  };

  onSimulate = () => {
    const { REACT_APP_CDN_HOST } = getEnv();

    window.open(
      `${REACT_APP_CDN_HOST}/test?type=kb&topic_id=${this.props.topic._id}`,
      'kbWindow',
      'width=800,height=800'
    );
  };

  renderScript(code: string, copied: boolean, name: string) {
    return (
      <MarkdownWrapper>
        <ReactMarkdown children={code} />
        {code ? (
          <CopyToClipboard text={code} onCopy={this.onCopy.bind(this, name)}>
            <Button btnStyle="primary" size="small" icon="copy-1">
              {copied ? 'Copied' : 'Copy to clipboard'}
            </Button>
          </CopyToClipboard>
        ) : (
          <EmptyState icon="copy" text="No copyable code" size="small" />
        )}
      </MarkdownWrapper>
    );
  }

  renderInstallCode() {
    if (this.props.topic && this.props.topic._id) {
      const { code, tag, copied, tagCopied } = this.state;

      return (
        <>
          <FormGroup>
            <ControlLabel>Install code</ControlLabel>
            {this.renderScript(code, copied, 'code')}
          </FormGroup>

          <FormGroup>
            <Info>
              {__(
                'Paste the tag below where you want erxes knowledgebase to appear'
              )}
            </Info>
            {this.renderScript(tag, tagCopied, 'tag')}
          </FormGroup>
        </>
      );
    }

    return null;
  }

  handleBrandChange = () => {
    if (this.props.topic && this.props.topic._id) {
      const code = KnowledgeForm.getInstallCode(this.props.topic._id);
      this.setState({ code, copied: false });
    }
  };

  generateDoc = (values: {
    _id?: string;
    title: string;
    description: string;
    brandId: string;
  }) => {
    const { topic } = this.props;
    const { color, backgroundImage, languageCode } = this.state;
    const finalValues = values;

    if (topic) {
      finalValues._id = topic._id;
    }

    return {
      _id: finalValues._id,
      doc: {
        brandId: finalValues.brandId,
        description: finalValues.description,
        languageCode,
        title: finalValues.title,
        color,
        backgroundImage
      }
    };
  };

  renderFormContent(topic = {} as ITopic, formProps: IFormProps) {
    const { color, backgroundImage, languageCode } = this.state;
    const { brand } = topic;
    const brandId = brand != null ? brand._id : '';

    const languageOnChange = selectLanguage => {
      this.setState({ languageCode: selectLanguage.value });
    };

    const popoverTop = (
      <Popover id="kb-color-picker">
        <TwitterPicker
          width="205px"
          triangle="hide"
          color={color}
          onChange={this.onColorChange}
        />
      </Popover>
    );

    return (
      <React.Fragment>
        <FormGroup>
          <ControlLabel required={true}>Title</ControlLabel>
          <FormControl
            {...formProps}
            name="title"
            defaultValue={topic.title}
            required={true}
            autoFocus={true}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Description</ControlLabel>
          <FormControl
            {...formProps}
            name="description"
            defaultValue={topic.description}
          />
        </FormGroup>

        <FormGroup>
          <SelectBrand
            isRequired={true}
            defaultValue={brandId}
            formProps={formProps}
            onChange={this.handleBrandChange}
          />
        </FormGroup>
        <FlexContent>
          <ExpandWrapper>
            <FormGroup>
              <ControlLabel>Language</ControlLabel>
              <Select
                id="languageCode"
                value={languageCode || 'en'}
                options={LANGUAGES}
                onChange={languageOnChange}
                formProps={formProps}
                clearable={false}
              />
            </FormGroup>
          </ExpandWrapper>

          <FormGroup>
            <ControlLabel>Custom color</ControlLabel>
            <div>
              <OverlayTrigger
                trigger="click"
                rootClose={true}
                placement="bottom"
                overlay={popoverTop}
              >
                <ColorPick>
                  <ColorPicker style={{ backgroundColor: color }} />
                </ColorPick>
              </OverlayTrigger>
            </div>
          </FormGroup>
        </FlexContent>

        <FormGroup>
          <ControlLabel>Background image: </ControlLabel>
          <Uploader
            multiple={false}
            single={true}
            defaultFileList={
              backgroundImage
                ? [
                    {
                      name: 'backgroundImage',
                      url: backgroundImage,
                      type: 'img'
                    }
                  ]
                : []
            }
            onChange={this.onBackgroundImageChange}
          />
        </FormGroup>

        {this.renderInstallCode()}
      </React.Fragment>
    );
  }

  renderContent = (formProps: IFormProps) => {
    const { topic, closeModal, renderButton } = this.props;
    const { values, isSubmitted } = formProps;

    return (
      <>
        {this.renderFormContent(
          topic ||
            ({
              title: '',
              description: '',
              languageCode: '',
              brand: { _id: '' }
            } as ITopic),
          { ...formProps }
        )}
        <ModalFooter>
          <Button
            btnStyle="simple"
            type="button"
            onClick={closeModal}
            icon="times-circle"
            uppercase={false}
          >
            Cancel
          </Button>
          {topic && (
            <>
              <Button
                btnStyle="danger"
                type="button"
                onClick={this.remove}
                icon="trash"
                uppercase={false}
              >
                Delete
              </Button>

              <Button
                btnStyle="primary"
                icon="plus-circle"
                onClick={this.onSimulate}
              >
                Simulate
              </Button>
            </>
          )}
          {renderButton({
            name: 'Knowledge Base',
            values: this.generateDoc(values),
            isSubmitted,
            callback: closeModal,
            object: topic
          })}
        </ModalFooter>
      </>
    );
  };

  render() {
    return <Form renderContent={this.renderContent} />;
  }
}

export default KnowledgeForm;
