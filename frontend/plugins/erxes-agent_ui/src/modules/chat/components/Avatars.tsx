import { ErxesLogoIcon } from 'erxes-ui';

export const AgentAvatar = ({ live }: { live?: boolean }) => (
  <div
    className={`size-8 shrink-0 rounded-full bg-transparent border border-primary/20 flex items-center justify-center ${
      live ? 'ea-avatar-live' : ''
    }`}
  >
    <ErxesLogoIcon className="size-5 text-primary flex-none" />
  </div>
);

// Shown only between sending and the first streamed event — once thinking /
// tool / text events arrive, the live assistant bubble takes over.
export const WaitingIndicator = () => (
  <div className="flex items-end gap-2.5 ea-msg-in">
    <AgentAvatar live />
    <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
      <div className="flex items-center gap-1.5">
        <span className="ea-typing-dot" />
        <span className="ea-typing-dot" />
        <span className="ea-typing-dot" />
      </div>
    </div>
  </div>
);
