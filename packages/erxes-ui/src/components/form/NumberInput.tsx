import React, { useEffect, useRef, useState } from 'react';
import { Input } from './styles';
import { numberFormatter, numberParser } from '../../utils/core';

let cursorPosition = 0;

function NumberInput(
  { value, onChange, fixed, max, min, ...props }: any,
  ref: any
) {
  const currentRef = useRef<HTMLInputElement>(null);
  const [numberValue, setNumberValue] = useState(value || props.defaultValue);

  useEffect(() => {
    setNumberValue(v => (v !== value ? value : v));
  }, [value]);

  function onChangeValue(e: any) {
    if (e.target.value === '') {
      onChange(e);
      setNumberValue(e.target.value);
    } else if (/^[0-9.,-]+$/.test(e.target.value)) {
      cursorPosition = e.target.value.length - e.target.selectionStart;
      e.target.value = numberParser(e.target.value, fixed);

      if (e.target.value > max) e.target.value = max;
      if (min > e.target.value) e.target.value = min;

      setNumberValue(e.target.value);
      onChange(e);
    }
  }

  useEffect(() => {
    if (currentRef.current) {
      let position = currentRef.current.value.length - cursorPosition;
      currentRef.current.selectionStart = position;
      currentRef.current.selectionEnd = position;
    }
  }, [numberValue]);

  return (
    <Input
      {...props}
      innerRef={currentRef}
      type={undefined}
      value={numberFormatter(numberValue, fixed)}
      onChange={onChangeValue}
    />
  );
}

export default React.forwardRef(NumberInput);
