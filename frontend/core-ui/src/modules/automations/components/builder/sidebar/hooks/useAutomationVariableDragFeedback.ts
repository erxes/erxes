import { useEffect } from 'react';
import { AUTOMATION_VARIABLE_DRAG_MIME } from 'ui-modules';

// Fields a dropped variable lands in as text; plugin inputs included
const TEXT_FIELD_SELECTOR = [
  'input:not([type])',
  'input[type="text"]',
  'input[type="search"]',
  'input[type="email"]',
  'input[type="url"]',
  'input[type="tel"]',
  'textarea',
  '[contenteditable="true"]',
].join(',');

const SCOPE_SELECTOR = '[data-variable-drop-scope]';
const EXCLUDE_SELECTOR = '[data-variable-drop-exclude]';
const CANDIDATE_ATTR = 'data-variable-drop-candidate';
const TARGET_ATTR = 'data-variable-drop-target';

/**
 * Feedback for dragging a variable: every field it can drop into is outlined,
 * and the one under the pointer is highlighted. Browsers do not update :hover
 * during a drag, so the fields are marked from the drag events instead.
 */
export const VARIABLE_DROP_FEEDBACK_CLASS =
  '[&_[data-variable-drop-candidate]]:outline-dashed [&_[data-variable-drop-candidate]]:outline-1 [&_[data-variable-drop-candidate]]:outline-primary/50 [&_[data-variable-drop-target]]:ring-2 [&_[data-variable-drop-target]]:ring-primary [&_[data-variable-drop-target]]:bg-primary/5';

const isVariableDrag = (event: DragEvent) =>
  !!event.dataTransfer?.types.includes(AUTOMATION_VARIABLE_DRAG_MIME);

export const useAutomationVariableDragFeedback = () => {
  useEffect(() => {
    let candidates: Element[] = [];
    let target: Element | null = null;

    const setTarget = (next: Element | null) => {
      if (target === next) {
        return;
      }

      target?.removeAttribute(TARGET_ATTR);
      next?.setAttribute(TARGET_ATTR, '');
      target = next;
    };

    const clear = () => {
      setTarget(null);
      candidates.forEach((field) => field.removeAttribute(CANDIDATE_ATTR));
      candidates = [];
    };

    // Bubble phase: the card has set its drag data by then
    const onDragStart = (event: DragEvent) => {
      if (!isVariableDrag(event)) {
        return;
      }

      candidates = Array.from(document.querySelectorAll(SCOPE_SELECTOR))
        .flatMap((scope) =>
          Array.from(scope.querySelectorAll(TEXT_FIELD_SELECTOR)),
        )
        .filter((field) => !field.closest(EXCLUDE_SELECTOR));
      candidates.forEach((field) => field.setAttribute(CANDIDATE_ATTR, ''));
    };

    // Capture phase: editors that stop the event must not hide the target
    const onDragOver = (event: DragEvent) => {
      if (!isVariableDrag(event)) {
        return;
      }

      const field =
        event.target instanceof Element
          ? event.target.closest(TEXT_FIELD_SELECTOR)
          : null;

      setTarget(
        field?.closest(SCOPE_SELECTOR) && !field.closest(EXCLUDE_SELECTOR)
          ? field
          : null,
      );
    };

    window.addEventListener('dragstart', onDragStart);
    window.addEventListener('dragover', onDragOver, true);
    window.addEventListener('drop', clear, true);
    window.addEventListener('dragend', clear, true);

    return () => {
      clear();
      window.removeEventListener('dragstart', onDragStart);
      window.removeEventListener('dragover', onDragOver, true);
      window.removeEventListener('drop', clear, true);
      window.removeEventListener('dragend', clear, true);
    };
  }, []);
};
