import { Toast } from './toasts';
import { useToast } from '../hooks/use-toast';

export function Toaster() {
  const { toasts, dismiss } = useToast();

  return (
    <Toast.Provider>
      {toasts.map(function ({
        id,
        title,
        description,
        action,
        dismissOnPointerEnter,
        ...props
      }) {
        return (
          <Toast
            key={id}
            {...props}
            onPointerEnter={(event) => {
              props.onPointerEnter?.(event);
              if (dismissOnPointerEnter && event.pointerType === 'mouse') {
                dismiss(id);
              }
            }}
          >
            <div className="grid gap-1">
              {title && <Toast.Title>{title}</Toast.Title>}
              {description && (
                <Toast.Description>{description}</Toast.Description>
              )}
            </div>
            {action}
            <Toast.Close />
          </Toast>
        );
      })}
      <Toast.Viewport />
    </Toast.Provider>
  );
}
