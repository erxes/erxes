import { getEnv } from 'apolloClient';
import Button from 'modules/common/components/Button';
import EmptyState from 'modules/common/components/EmptyState';
import FormControl from 'modules/common/components/form/Control';
import Form from 'modules/common/components/form/Form';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import Info from 'modules/common/components/Info';
import Uploader from 'modules/common/components/Uploader';
import colors from 'modules/common/styles/colors';
import { ModalFooter } from 'modules/common/styles/main';
import {
  IAttachment,
  IButtonMutateProps,
  IFormProps
} from 'modules/common/types';
import { __ } from 'modules/common/utils';
import { FlexContent } from 'modules/layout/styles';
import { IBrand } from 'modules/settings/brands/types';
import SelectBrand from 'modules/settings/integrations/containers/SelectBrand';
import {
  ColorPick,
  ColorPicker,
  ExpandWrapper,
  MarkdownWrapper
} from 'modules/settings/styles';
import React from 'react';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';
import TwitterPicker from 'react-color/lib/Twitter';
import CopyToClipboard from 'react-copy-to-clipboard';
import ReactMarkdown from 'react-markdown';
import { ITopic } from '../../types';

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
      backgroundImage
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

  renderScript(code: string, copied: boolean, name: string) {
    return (
      <MarkdownWrapper>
        <ReactMarkdown source={code} />
        {code ? (
          <CopyToClipboard text={code} onCopy={this.onCopy.bind(this, name)}>
            <Button size="small" btnStyle="primary" icon="copy">
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
    languageCode: string;
  }) => {
    const { topic } = this.props;
    const { color, backgroundImage } = this.state;
    const finalValues = values;

    if (topic) {
      finalValues._id = topic._id;
    }

    return {
      _id: finalValues._id,
      doc: {
        brandId: finalValues.brandId,
        description: finalValues.description,
        languageCode: finalValues.languageCode,
        title: finalValues.title,
        color,
        backgroundImage
      }
    };
  };

  renderFormContent(topic = {} as ITopic, formProps: IFormProps) {
    const { color, backgroundImage } = this.state;
    const { brand } = topic;
    const brandId = brand != null ? brand._id : '';

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

              <FormControl
                {...formProps}
                componentClass="select"
                defaultValue={topic.languageCode || 'en'}
                name="languageCode"
              >
                <option />
                <option value="mn">Монгол</option>
                <option value="en">English</option>
              </FormControl>
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
          topic || {
            title: '',
            description: '',
            languageCode: '',
            brand: { _id: '' }
          },
          { ...formProps }
        )}
        <ModalFooter>
          <Button
            btnStyle="simple"
            type="button"
            onClick={closeModal}
            icon="cancel-1"
          >
            Cancel
          </Button>
          {topic && (
            <Button
              btnStyle="danger"
              type="button"
              onClick={this.remove}
              icon="cancel-1"
            >
              Delete
            </Button>
          )}
          {renderButton({
            name: 'knowledge base',
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
