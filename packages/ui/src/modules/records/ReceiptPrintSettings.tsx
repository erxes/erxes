import { Skeleton } from '../../components/skeleton';
import { hostComponent } from '../../utils/host-component';

/** What `ReceiptPrintSettings` takes. */
export interface ReceiptPrintSettingsProps {
  /** The plugin whose eBarimt receipts it sets, by its name: `ecommerce`. */
  plugin: string;
}

const settings = hostComponent<ReceiptPrintSettingsProps>(<Skeleton className="h-96 w-full" />);

/** Registers core's receipt print settings. Web calls it at startup; plugins don't. */
export const setReceiptPrintSettings = settings.set;

/**
 * How a plugin's eBarimt receipts print, set in the plugin's own settings.
 * `<ReceiptPrintSettings plugin="ecommerce" />` draws core's editor: the paper, the parts in
 * order, the header and footer text, and a live preview with a test print. Before eBarimt is set
 * up it says so and links to its setup. The host app (web) registers the component; outside
 * erxes it renders nothing.
 */
export const ReceiptPrintSettings = settings.Host;
