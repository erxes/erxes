import { __, ControlLabel, FormGroup, Uploader } from '@erxes/ui/src';
import PlaceHolderInput from '@erxes/ui-automations/src/components/forms/actions/placeHolder/PlaceHolderInput';
import React, { useEffect, useState } from 'react';
import { FieldInfo } from '../../styles';
import Common from '@erxes/ui-automations/src/components/forms/actions/Common';
import { IAction } from '@erxes/ui-automations/src/types';
import { DrawerDetail } from '@erxes/ui-automations/src/styles';

type Props = {
  activeAction: IAction;
  triggerType: string;
  closeModal: () => void;
  addAction: (action: IAction, actionId?: string, config?: any) => void;
};

export default function ReplyComments({
  triggerType,
  closeModal,
  addAction,
  activeAction,
}: Props) {
  const [config, setConfig] = useState<any>({});
  const limit = 8000;

  useEffect(() => {
    setConfig(activeAction?.config);
  }, [activeAction?.config]);

  const { text = '', attachments = [] } = config || {};

  const handleChange = (name, value) => {
    setConfig({ ...config, [name]: value });
  };

  return (
    <Common
      closeModal={closeModal}
      addAction={addAction}
      activeAction={activeAction}
      config={config}
    >
      <DrawerDetail>
        <FormGroup>
          <ControlLabel>
            {__('Text')}
            <FieldInfo
              error={text.length > limit}
            >{`${text?.length}/${limit}`}</FieldInfo>
          </ControlLabel>
          <PlaceHolderInput
            config={{ text }}
            triggerType={triggerType}
            inputName="text"
            componentClass="textarea"
            label=""
            placeholder={__("Enter your text...")}
            onChange={setConfig}
            textLimit={limit}
          />
        </FormGroup>
        <Uploader
          single
          defaultFileList={attachments}
          onChange={(attachments) => handleChange('attachments', attachments)}
        />
      </DrawerDetail>
    </Common>
  );
}
