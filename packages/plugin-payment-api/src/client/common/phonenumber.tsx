/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, memo, useRef, createRef } from 'react';
import { Input } from '../common/input';

const PhoneNumber = ({
  inputRegExp = /^[0-9]$/,
  amount = 8,
  handleOutputString = () => {},
  value,
  id
}: any) => {
  const [characterArray, setCharacterArray] = useState<any[]>(
    Array(amount).fill('')
  );
  const [elRefs, setElRefs] = useState<any[]>([]);
  const [selectedInput, setSelectedInput] = useState<any>(0);
  const didMount = useRef(false);
  const [latestClickedKey, changeKey] = useState<string>('');

  const focusNextChar = (target: any) => {
    if (target.nextElementSibling !== null) {
      target.nextElementSibling.focus();
    }
  };

  const focusPrevChar = (target: any) => {
    if (target.previousElementSibling !== null) {
      target.previousElementSibling.focus();
    }
  };

  const setModuleOutput = () => {
    setCharacterArray((arr: any[]) => {
      const updatedCharacters = arr.map((character, number) => {
        return elRefs[number].current.value;
      });
      return updatedCharacters;
    });
  };

  const handleChange = ({ target }: any) => {
    if (target.value.match(inputRegExp)) {
      focusNextChar(target);
      setModuleOutput();
    } else {
      target.value =
        characterArray[Number(target.name.replace('input', ''))] || '';
    }
  };

  const handleKeyDown = ({ target, key }: any) => {
    if (key === 'Backspace') {
      if (target.value === '' && target.previousElementSibling !== null) {
        target.previousElementSibling.value = '';
        focusPrevChar(target);
      } else {
        target.value = '';
      }
      setModuleOutput();
    } else if (key === 'ArrowLeft') {
      focusPrevChar(target);
    } else if (key === 'ArrowRight' || key === ' ') {
      focusNextChar(target);
    }
  };

  const handleFocus = ({ target }: any) => {
    var el = target;
    // In most browsers .select() does not work without the added timeout.
    setTimeout(function () {
      el.select();
      setSelectedInput(Number(el.name.replace('input', '')));
    }, 0);
  };

  useEffect(() => {
    if ((selectedInput + '').match(inputRegExp)) {
      setTimeout(function () {
        elRefs[selectedInput] && elRefs[selectedInput].current.select();
      }, 0);
    }
  }, [selectedInput]);

  useEffect(() => {
    value && setCharacterArray(value.split(''));
  }, []);

  useEffect(() => {
    // add or remove refs
    setElRefs(elRefs =>
      Array(amount)
        .fill(null)
        .map((_, i) => elRefs[i] || createRef())
    );
  }, [amount]);

  useEffect(() => {
    if (!didMount.current) {
      didMount.current = true;
      return;
    }
    setSelectedInput((prev: number) => {
      if (latestClickedKey) {
        if (latestClickedKey === 'C') {
          return prev === 0 ? 0 : prev - 1;
        }
        return prev === amount - 1 ? prev : prev + 1;
      }
    });
    changeKey('');

    const str = characterArray.join('');
    str && handleOutputString(str);
  }, [characterArray]);

  useEffect(() => {
    if (latestClickedKey) {
      if (latestClickedKey === 'C') {
        setCharacterArray((prev: any[]) => {
          let updated = prev.slice();
          updated[selectedInput] = '';
          return updated;
        });
        return;
      }
      setCharacterArray((prev: any[]) => {
        let updated = prev.slice();
        updated[selectedInput] = latestClickedKey;
        return updated;
      });
    }
  }, [latestClickedKey]);
  return (
    <div className="relative inline-flex">
      <div className="inline-flex">
        {Array.from({ length: 4 }).map((_, idx) => (
          <Input
            key={idx}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            name={'input' + idx}
            ref={elRefs[idx]}
            value={characterArray[idx]}
            className={
              'h-10 w-9 text-center focus-visible:z-10 rounded-none' +
              (idx === 0 ? ' border-l rounded-s-lg' : '   border-l-0') +
              (idx === 3 ? ' rounded-e-lg' : '')
            }
            id={idx === 0 ? id : undefined}
          />
        ))}
        {Array.from({ length: 4 }).map((_, idx) => (
          <Input
            key={idx + 4}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            name={'input' + (idx + 4)}
            ref={elRefs[idx + 4]}
            value={characterArray[idx + 4]}
            className={
              'h-10  w-9 text-center rounded-none last-of-type:rounded-e-lg focus-visible:z-10' +
              (idx === 0 ? ' ml-8 border-l rounded-s-lg' : ' border-l-0')
            }
          />
        ))}
      </div>
      <span className=" h-4 w-4 inline-flex items-center justify-center inset-center ">
        •
      </span>
    </div>
  );
};

export default memo(PhoneNumber);
