import { __, Button, colors, Icon } from '@erxes/ui/src';
import { FlexRow } from '@erxes/ui-settings/src/styles';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import { useEffect, useState } from 'react';
import React from 'react';
import { ItemRowHeader } from '../../../styles';
import { Divider } from '@erxes/ui-cards/src/boards/styles/stage';

type Props = {
  title: string;
  content: (doc: any, onChange: (...props: any) => void) => React.ReactNode;
  subContent: string;
  description: string;
  buttonText: string;
  isDone?: boolean;
  onSave: (...props: any) => void;
  config: any;
};

export const ItemRow = ({
  title,
  content,
  subContent,
  description,
  buttonText,
  isDone,
  onSave,
  config
}: Props) => {
  const [isOpen, setOpen] = useState(false);
  const [doc, setDoc] = useState({});

  useEffect(() => {
    setDoc(config);
  }, [config]);

  const toggleOpen = () => setOpen(!isOpen);

  const handleSave = () => {
    onSave(doc);
    toggleOpen();
  };

  return (
    <>
      <div>
        <FlexRow $justifyContent="space-between">
          <FlexRow $alignItems="baseline">
            <ItemRowHeader>
              {title}
              <span>{!isOpen && subContent}</span>
            </ItemRowHeader>
            {isDone && (
              <Icon
                color={colors.colorCoreGreen}
                icon="check-circle"
                style={{ paddingLeft: '6px' }}
              />
            )}
          </FlexRow>
          {isOpen ? (
            <Button
              btnStyle="white"
              icon="times"
              iconColor={colors.colorPrimary}
              onClick={toggleOpen}
            />
          ) : (
            <Button btnStyle="white" onClick={toggleOpen}>
              {`Edit ${buttonText}`}
            </Button>
          )}
        </FlexRow>

        <span>{isOpen && description}</span>
      </div>
      {isOpen && content(doc, setDoc)}
      {isOpen && (
        <ModalFooter>
          <Button size="small" btnStyle="simple" onClick={toggleOpen}>
            {__('Cancel')}
          </Button>
          <Button size="small" btnStyle="success" onClick={handleSave}>
            {__('Save')}
          </Button>
        </ModalFooter>
      )}
      <Divider />
    </>
  );
};
