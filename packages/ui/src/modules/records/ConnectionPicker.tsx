import { hostComponent } from '../../utils/host-component';

/** The content type core's side panel opens a vault connection as. */
export const CONNECTION_CONTENT_TYPE = 'core:connection';

/** What `ConnectionPicker` takes. */
export interface ConnectionPickerProps {
  /** One integration's connections, by its key: `storepay`. */
  integration?: string;
  /** Every integration's of a category: `payments`. */
  category?: string;
  value: string | null;
  onValueChange: (connectionId: string | null) => void;
  /** A first row that picks none, e.g. "First active gateway". */
  noneLabel?: string;
  /** Limits the choice to these connections. */
  only?: string[];
}

const picker = hostComponent<ConnectionPickerProps>();

/** Registers core's connection picker. Web calls it at startup; plugins don't. */
export const setConnectionPicker = picker.set;

/**
 * Picks one of the organisation's vault connections. It never shows a key.
 * `<ConnectionPicker integration="storepay" value={connectionId} onValueChange={setConnectionId} />`
 * lists the saved StorePay connections; the picked one is a chip that opens it beside the page.
 * With none saved it is the integration's card with Connect, which opens the vault's form in
 * core's side panel and picks the new connection once saved. The feature stores only the id.
 * The host app (web) registers the component; outside erxes it renders nothing.
 */
export const ConnectionPicker = picker.Host;
