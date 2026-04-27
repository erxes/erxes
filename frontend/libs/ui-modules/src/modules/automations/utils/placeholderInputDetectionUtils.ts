import {
  SuggestionConfig,
  SuggestionType,
} from '../types/placeholderInputTypes';

export function isInsideLockedExpression(value: string, cursorPos: number) {
  const before = (value || '').slice(0, cursorPos);
  const after = (value || '').slice(cursorPos);
  const lastOpenCurly = before.lastIndexOf('{{');
  const lastCloseCurly = before.lastIndexOf('}}');
  const lastOpenBracket = before.lastIndexOf('[' + '[');
  const lastCloseBracket = before.lastIndexOf(']' + ']');
  const inCurly = lastOpenCurly > lastCloseCurly && after.indexOf('}}') !== -1;
  const inBracket =
    lastOpenBracket > lastCloseBracket && after.indexOf(']' + ']') !== -1;
  return { inCurly, inBracket };
}

export function findActualTriggerPosition(
  value: string,
  cursorPos: number,
  suggestionTypeByTriggerMap: Map<string, SuggestionConfig>,
  fallbackPos: number,
) {
  let actualTriggerPos = fallbackPos;
  if (fallbackPos >= cursorPos || fallbackPos < 0) {
    const textBeforeCursor = (value || '').slice(0, cursorPos);
    for (let i = cursorPos - 1; i >= 0; i--) {
      const char = textBeforeCursor[i];
      const { type } = suggestionTypeByTriggerMap.get(char) || {};
      if (char && type) {
        const textAfterTrigger = textBeforeCursor.slice(i + 1, cursorPos);
        if (
          !textAfterTrigger.includes(',') &&
          !textAfterTrigger.includes(' ')
        ) {
          actualTriggerPos = i;
          break;
        }
      }
    }
  }
  return actualTriggerPos;
}

export function getDateNowContext(value: string, cursorPos: number) {
  const text = value || '';
  // Find the nearest opening '{{' before cursor and matching closing '}}' after
  const before = text.slice(0, cursorPos);
  const after = text.slice(cursorPos);
  const openPos = before.lastIndexOf('{{');
  const closePosAhead = after.indexOf('}}');
  if (openPos === -1 || closePosAhead === -1) {
    return { inside: false, afterNow: false, start: -1, end: -1 };
  }
  const start = openPos;
  const end = cursorPos + closePosAhead + 2; // include closing braces
  const insideText = text.slice(start + 2, end - 2).trim();
  // We only allow when expression starts with "now"
  const afterNowMatch = /^now(.*)$/i.exec(insideText);
  if (!afterNowMatch) {
    return { inside: true, afterNow: false, start, end };
  }
  const nowIndexInInner = text
    .slice(start + 2, cursorPos)
    .toLowerCase()
    .lastIndexOf('now');
  const afterNow =
    nowIndexInInner !== -1 &&
    cursorPos > start + 1 + nowIndexInInner + 'now'.length;
  return { inside: true, afterNow, start, end };
}

export function isAllowedDateNowEditKey(key: string) {
  // Allow digits, '+' and '-' only (no spaces allowed)
  if (key.length === 1) {
    return /[0-9+\-]/.test(key);
  }
  // Also allow navigation keys without editing
  return (
    key === 'ArrowLeft' ||
    key === 'ArrowRight' ||
    key === 'ArrowUp' ||
    key === 'ArrowDown' ||
    key === 'Tab'
  );
}

export function shouldEnableDateSuggestions(
  value: string,
  cursorPos: number,
  enabledTypes?: Record<SuggestionType, boolean>,
) {
  const { inside } = getDateNowContext(value, cursorPos);
  const isEnabled = !enabledTypes || enabledTypes['date'];
  return inside && isEnabled;
}

export function getEnclosingExpressionRangeOnBackspace(
  value: string,
  cursorPos: number,
) {
  const text = value || '';
  if (cursorPos < 2) return null;
  const justBefore = text.slice(cursorPos - 2, cursorPos);
  if (justBefore !== '}}' && justBefore !== ']]') return null;

  const isCurly = justBefore === '}}';
  const openToken = isCurly ? '{{' : '[[';
  const closeToken = justBefore; // at cursorPos-2..cursorPos

  // Find the nearest opening token before the closing token
  const beforeClose = text.slice(0, cursorPos - 2);
  const openPos = beforeClose.lastIndexOf(openToken);
  if (openPos === -1) return null;

  const end = cursorPos; // include the two closing chars we are right after
  const start = openPos; // include the two opening chars

  // Basic sanity: ensure there is not an unmatched closing in between
  // (simple heuristic sufficient for our non-nested placeholders)
  const between = text.slice(openPos + 2, cursorPos - 2);
  if (between.includes(closeToken)) return null;

  return { start, end };
}
