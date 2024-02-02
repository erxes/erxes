import { ColorPick, ColorPicker, ModalFooter } from '@erxes/ui/src/styles/main';
import { ExpandWrapper, MarkdownWrapper } from '@erxes/ui-settings/src/styles';
import {
  IAttachment,
  IButtonMutateProps,
  IFormProps,
} from '@erxes/ui/src/types';
import { __, getEnv } from '@erxes/ui/src/utils';

import Button from '@erxes/ui/src/components/Button';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import CopyToClipboard from 'react-copy-to-clipboard';
import EmptyState from '@erxes/ui/src/components/EmptyState';
import { FlexContent } from '@erxes/ui/src/layout/styles';
import Form from '@erxes/ui/src/components/form/Form';
import FormControl from '@erxes/ui/src/components/form/Control';
import FormGroup from '@erxes/ui/src/components/form/Group';
import { IBrand } from '@erxes/ui/src/brands/types';
import { ITopic } from '@erxes/ui-knowledgebase/src/types';
import Info from '@erxes/ui/src/components/Info';
import { LANGUAGES } from '@erxes/ui-settings/src/general/constants';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';
import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import Select from 'react-select-plus';
import SelectBrand from '@erxes/ui-inbox/src/settings/integrations/containers/SelectBrand';
import TwitterPicker from 'react-color/lib/Twitter';
import Uploader from '@erxes/ui/src/components/Uploader';
import colors from '@erxes/ui/src/styles/colors';
import { isEnabled } from '@erxes/ui/src/utils/core';

// Define type for component props
type Props = {
  topic: ITopic;
  brands: IBrand[];
  segments: any[];
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  remove?: (knowledgeBaseId: string) => void;
  closeModal: () => void;
};

const KnowledgeForm = (props: Props) => {
  // Destructure props
  const { topic, segments, closeModal, renderButton, remove } = props;

  // State variables
  const [copied, setCopied] = useState<boolean>(false);
  const [tagCopied, setTagCopied] = useState<boolean>(false);
  const [code, setCode] = useState<string>('');
  const [tag, setTag] = useState<string>('');
  const [color, setColor] = useState<string>(colors.colorPrimary);
  const [backgroundImage, setBackgroundImage] = useState<string>('');
  const [languageCode, setLanguageCode] = useState<string>('');
  const [notificationSegmentId, setNotificationSegmentId] = useState<
    string | null
  >(null);

  // useEffect to set initial values
  useEffect(() => {
    if (topic) {
      setCode(getInstallCode(topic._id));
      setTag(getInstallTag());
      setColor(topic.color);
      setBackgroundImage(topic.backgroundImage);
      setLanguageCode(topic.languageCode);
      setNotificationSegmentId(topic.notificationSegmentId);
    }
  }, [topic]);

  // Define installCodeIncludeScript function
  const installCodeIncludeScript = () => {
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
  };

  // Define getInstallCode function
  const getInstallCode = (topicId: string) => {
    return `
      <script>
        window.erxesSettings = {
          knowledgeBase: {
            topic_id: "${topicId}"
          },
        };
        ${installCodeIncludeScript()}
      </script>
    `;
  };

  // Define getInstallTag function
  const getInstallTag = () => {
    return `
      <div data-erxes-kbase style="width:900px;height:300px"></div>
    `;
  };

  // Handle color change
  const handleColorChange = (e: { hex: string }) => {
    setColor(e.hex);
  };

  // Handle copy to clipboard
  const handleCopy = (name: string) => {
    if (name === 'code') {
      setCopied(true);
    } else {
      setTagCopied(true);
    }
  };

  // Handle background image change
  const onBackgroundImageChange = ([file]: IAttachment[]) => {
    setBackgroundImage(file ? file.url : '');
  };

  // Handle removal of topic
  const handleRemove = () => {
    if (remove && topic) {
      remove(topic._id);
    }
  };

  // Handle simulation
  const handleSimulate = () => {
    const { REACT_APP_CDN_HOST } = getEnv();

    window.open(
      `${REACT_APP_CDN_HOST}/test?type=kb&topic_id=${topic?._id}`,
      'kbWindow',
      'width=800,height=800',
    );
  };

  // Render copyable script
  const renderScript = (code: string, copied: boolean, name: string) => {
    return (
      <MarkdownWrapper>
        <ReactMarkdown children={code} />
        {code ? (
          <CopyToClipboard text={code} onCopy={() => handleCopy(name)}>
            <Button btnStyle="primary" size="small" icon="copy-1">
              {copied ? 'Copied' : 'Copy to clipboard'}
            </Button>
          </CopyToClipboard>
        ) : (
          <EmptyState icon="copy" text="No copyable code" size="small" />
        )}
      </MarkdownWrapper>
    );
  };

  // Render installation code
  const renderInstallCode = () => {
    if (topic && topic._id) {
      return (
        <>
          <FormGroup>
            <ControlLabel>Install code</ControlLabel>
            {renderScript(code, copied, 'code')}
          </FormGroup>

          <FormGroup>
            <Info>
              {__(
                'Paste the tag below where you want erxes knowledgebase to appear',
              )}
            </Info>
            {renderScript(tag, tagCopied, 'tag')}
          </FormGroup>
        </>
      );
    }

    return null;
  };

  // Handle brand change
  const handleBrandChange = () => {
    if (topic && topic._id) {
      const newCode = getInstallCode(topic._id);
      setCode(newCode);
      setCopied(false);
    }
  };

  // Handle notification segment change
  const onChangeNotificationSegment = ({ value }: { value: string }) => {
    setNotificationSegmentId(value);
  };

  // Generate document
  const generateDoc = (values: {
    _id?: string;
    title: string;
    description: string;
    brandId: string;
  }) => {
    const finalValues = { ...values };

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
        backgroundImage,
        notificationSegmentId,
      },
    };
  };

  // Render form content
  const renderFormContent = (currentTopic: ITopic, formProps: IFormProps) => {
    const { brand } = currentTopic;
    const brandId = brand != null ? brand._id : '';

    // Handle language change
    const handleLanguageChange = (selectLanguage: { value: string }) => {
      setLanguageCode(selectLanguage.value);
    };

    // Popover content
    const popoverTop = (
      <Popover id="kb-color-picker">
        <TwitterPicker
          width="205px"
          triangle="hide"
          color={color}
          onChange={handleColorChange}
        />
      </Popover>
    );

    return (
      <>
        <FormGroup>
          <ControlLabel required={true}>Title</ControlLabel>
          <FormControl
            {...formProps}
            name="title"
            defaultValue={currentTopic.title}
            required={true}
            autoFocus={true}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Description</ControlLabel>
          <FormControl
            {...formProps}
            name="description"
            defaultValue={currentTopic.description}
          />
        </FormGroup>

        <FormGroup>
          <SelectBrand
            isRequired={true}
            defaultValue={brandId}
            formProps={formProps}
            onChange={handleBrandChange}
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
                onChange={handleLanguageChange}
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
                      type: 'img',
                    },
                  ]
                : []
            }
            onChange={onBackgroundImageChange}
          />
        </FormGroup>

        {isEnabled('segments') && (
          <FormGroup>
            <ControlLabel>Notification segment</ControlLabel>
            <Select
              options={segments.map((segment) => ({
                label: `${segment.name}`,
                value: segment._id,
              }))}
              value={notificationSegmentId}
              onChange={onChangeNotificationSegment}
            />
          </FormGroup>
        )}

        {renderInstallCode()}
      </>
    );
  };

  // Render content
  const renderContent = (formProps: IFormProps) => {
    const { values, isSubmitted } = formProps;

    return (
      <>
        {renderFormContent(
          topic || {
            title: '',
            description: '',
            languageCode: '',
            brand: { _id: '' },
          },
          { ...formProps },
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
                onClick={handleRemove}
                icon="trash"
                uppercase={false}
              >
                Delete
              </Button>

              <Button
                btnStyle="primary"
                icon="plus-circle"
                onClick={handleSimulate}
              >
                Simulate
              </Button>
            </>
          )}
          {renderButton({
            name: 'Knowledge Base',
            values: generateDoc(values),
            isSubmitted,
            callback: closeModal,
            object: topic,
          })}
        </ModalFooter>
      </>
    );
  };

  return <Form renderContent={renderContent} />;
};

export default KnowledgeForm;
