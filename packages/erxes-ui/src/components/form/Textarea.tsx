import React, { useEffect, useRef } from "react";

import { TextArea } from "./styles";

type Props = {
  onChange?: (e: React.FormEvent<HTMLTextAreaElement>) => void;
  hasError?: boolean;
  maxHeight?: number;
};

const Textarea: React.FC<Props> = ({
  maxHeight,
  hasError,
  onChange,
  ...props
}) => {
  const areaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    setHeight();
  }, []);

  const setHeight = () => {
    const textarea = areaRef.current;

    if (textarea) {
      // Reset element's scrollHeight
      textarea.style.height = "0";
      // Add 1px for border height
      textarea.style.height = `${textarea.scrollHeight + 1}px`;
    }
  };

  const handleChange = (e: React.FormEvent<HTMLTextAreaElement>) => {
    setHeight();

    if (onChange) {
      onChange(e);
    }
  };

  return (
    <TextArea
      {...props}
      as="textarea"
      $hasError={hasError}
      ref={(area) => (areaRef.current = area)}
      maxHeight={maxHeight}
      onChange={handleChange}
    />
  );
};

export default Textarea;
