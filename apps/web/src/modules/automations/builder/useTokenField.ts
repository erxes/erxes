import { useEffect, useEffectEvent, useLayoutEffect, useRef } from 'react';
import { placeholderLabel, placeholderOf, templateParts } from './templateText';
import type { FieldInfo } from './useAutomationFields';

const CHIP =
  'mx-px inline-block rounded-full bg-primary/10 px-1.5 align-baseline text-xs leading-5 text-primary-text ring-1 ring-primary/25 select-none';

const chipLabel = (path: string, filters: string | undefined, fields: FieldInfo[]) =>
  placeholderLabel(path, filters, fields) ?? path.split('.').at(-1) ?? path;

const chipOf = (token: string, name: string) => {
  const chip = document.createElement('span');

  chip.contentEditable = 'false';
  chip.dataset.token = token;
  chip.className = CHIP;
  chip.textContent = name;

  return chip;
};

const draw = (element: HTMLElement, value: string, names: string[]) => {
  let next = 0;

  element.replaceChildren(
    ...templateParts(value).map((part) =>
      'text' in part
        ? document.createTextNode(part.text)
        : chipOf(part.token, names[next++] ?? part.path),
    ),
  );
};

const textOf = (node: Node): string =>
  [...node.childNodes]
    .map((child) => {
      if (child instanceof Text) return child.data.replaceAll(' ', ' ');

      if (!(child instanceof HTMLElement)) return '';

      if (child.dataset.token) return child.dataset.token;

      if (child.tagName === 'BR') return child === node.lastChild ? '' : '\n';

      return child.tagName === 'DIV' ? `\n${textOf(child)}` : textOf(child);
    })
    .join('');

const chipsOf = (element: HTMLElement) =>
  [...element.querySelectorAll<HTMLElement>('[data-token]')].map((chip) => chip.textContent);

const caretIn = (element: HTMLElement) => {
  const selection = window.getSelection();
  const range = selection?.rangeCount ? selection.getRangeAt(0) : null;

  return range && element.contains(range.commonAncestorContainer) ? range.cloneRange() : null;
};

const endOf = (element: HTMLElement) => {
  const range = document.createRange();

  range.selectNodeContents(element);
  range.collapse(false);

  return range;
};

const place = (element: HTMLElement, at: Range | null, nodes: Node[]) => {
  const range = at ?? endOf(element);

  range.deleteContents();
  nodes.toReversed().forEach((node) => range.insertNode(node));

  const last = nodes.at(-1);
  const after = document.createRange();

  if (last) after.setStartAfter(last);

  after.collapse(true);
  window.getSelection()?.removeAllRanges();
  window.getSelection()?.addRange(after);
};

const needsSpace = (range: Range | null) => {
  const node = range?.startContainer;
  const before = node instanceof Text ? node.data.slice(0, range?.startOffset).at(-1) : undefined;

  return before !== undefined && !/[\s([{"'«/@-]/.test(before);
};

/**
 * A contenteditable field whose placeholders show as chips. The DOM is drawn from `value` only
 * when it differs, so the caret stays put while typing.
 */
export const useTokenField = ({
  value,
  fields,
  multiline,
  onChange,
}: {
  value: string;
  fields: FieldInfo[];
  multiline?: boolean;
  onChange: (value: string) => void;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const caret = useRef<Range | null>(null);

  const labels = templateParts(value)
    .flatMap((part) => ('token' in part ? [chipLabel(part.path, part.filters, fields)] : []))
    .join('\n');

  useLayoutEffect(() => {
    const element = ref.current;

    if (element && (textOf(element) !== value || chipsOf(element).join('\n') !== labels))
      draw(element, value, labels.split('\n'));
  }, [value, labels]);

  const remember = () => {
    if (ref.current) caret.current = caretIn(ref.current);
  };

  const put = (nodes: Node[]) => {
    const element = ref.current;

    if (!element) return;

    element.focus();
    place(element, caret.current, nodes);
    remember();
    onChange(textOf(element));
  };

  const onInput = useEffectEvent(() => {
    remember();

    if (ref.current) onChange(textOf(ref.current));
  });

  const onBeforeInput = useEffectEvent((event: InputEvent) => {
    if (event.inputType !== 'insertParagraph' && event.inputType !== 'insertLineBreak') return;

    event.preventDefault();

    if (multiline) put([document.createTextNode('\n')]);
  });

  const onPaste = useEffectEvent((event: ClipboardEvent) => {
    event.preventDefault();

    const pasted = event.clipboardData?.getData('text/plain') ?? '';

    put([document.createTextNode(multiline ? pasted : pasted.replaceAll(/\s*\n\s*/g, ' '))]);
  });

  const onCaret = useEffectEvent(remember);

  useEffect(() => {
    const element = ref.current;

    if (!element) return;

    const stop = (event: Event) => event.preventDefault();
    const caretMoves = ['keyup', 'mouseup', 'blur'] as const;

    element.addEventListener('input', onInput);
    element.addEventListener('beforeinput', onBeforeInput);
    element.addEventListener('paste', onPaste);
    element.addEventListener('drop', stop);
    caretMoves.forEach((type) => element.addEventListener(type, onCaret));

    return () => {
      element.removeEventListener('input', onInput);
      element.removeEventListener('beforeinput', onBeforeInput);
      element.removeEventListener('paste', onPaste);
      element.removeEventListener('drop', stop);
      caretMoves.forEach((type) => element.removeEventListener(type, onCaret));
    };
  }, []);

  const insert = (path: string) => {
    const space = needsSpace(caret.current) ? [document.createTextNode(' ')] : [];

    put([...space, chipOf(placeholderOf(path), chipLabel(path, undefined, fields))]);
  };

  return { ref, insert };
};
