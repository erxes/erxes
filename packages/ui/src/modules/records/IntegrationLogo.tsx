import { hostComponent } from '../../utils/host-component';

/** What `IntegrationLogo` takes. */
export interface IntegrationLogoProps {
  /** The integration's key, as core's gateways and integrations list it: `qpay`, `storepay`. */
  integrationKey: string;
  /** Its name, for the first-letter mark when core has no logo for it. */
  name: string;
  className?: string;
}

const logo = hostComponent<IntegrationLogoProps>();

/** Registers core's integration logos. Web calls it at startup; plugins don't. */
export const setIntegrationLogo = logo.set;

/**
 * An integration's logo, as Settings › Integrations shows it.
 * `<IntegrationLogo integrationKey="qpay" name="QPay" className="size-6" />`; core draws the
 * first letter of `name` when it has no logo. The host app (web) registers the component; outside erxes it
 * renders nothing.
 */
export const IntegrationLogo = logo.Host;
