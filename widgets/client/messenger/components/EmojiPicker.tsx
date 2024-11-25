import * as React from 'react';
//@ts-ignore
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import { iconEmoji } from '../../icons/Icons';

type Props = {
  onEmojiSelect: (emoji: any) => void;
};

const EmojiPicker: React.FC<Props> = ({ onEmojiSelect }) => {
  const [isVisible, setIsVisible] = React.useState(false);
  const togglePicker = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsVisible(!isVisible);
  };
  const hidePicker = () => {
    setIsVisible(false);
  };

  return (
    <div className="emoji-picker-wrapper">
      <button title="Choose an emoji" onClick={togglePicker} type="button">
        {iconEmoji}
      </button>
      {isVisible ? (
        <Picker
          theme="dark"
          className="emoji-picker-container"
          data={data}
          onEmojiSelect={onEmojiSelect}
          onClickOutside={hidePicker}
        />
      ) : null}
    </div>
  );
};

export default EmojiPicker;
