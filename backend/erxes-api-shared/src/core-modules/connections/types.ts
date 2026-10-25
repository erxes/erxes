/**
 * Connection contract shared by core (which stores connections) and every
 * service that registers a connection type or reads a connection.
 *
 * Every connection has the same shape: a tenant-unique name, an icon or
 * logo, a registered type and key/value fields. The type's field schema
 * decides which fields are plain and which are secret.
 */

export type TConnectionFieldInputType =
  | 'text'
  | 'url'
  | 'email'
  | 'number'
  | 'textarea';

export interface IConnectionFieldDefinition {
  // `^[A-Za-z][A-Za-z0-9_]{0,63}$`
  key: string;
  label: string;
  description?: string;
  placeholder?: string;
  required?: boolean;
  // Sealed at rest, never returned to the browser, write-only in the UI.
  secret?: boolean;
  inputType?: TConnectionFieldInputType;
  // Simple validation, checked by core on save.
  pattern?: string;
  minLength?: number;
  maxLength?: number;
}

/** A decrypted connection. Server-only: never return it to a browser. */
export interface IConnectionValue {
  _id: string;
  name: string;
  type: string;
  fields: Record<string, string>;
}

export interface IConnectionTestResult {
  ok: boolean;
  // Shown to the user: never echo a field value here.
  message?: string;
}

export interface IConnectionResolverContext {
  subdomain: string;
}

/**
 * What a developer writes to add a connection type. `id` is local to the
 * registering service: a plugin `ai` registering `provider` creates the type
 * `ai:provider`. One type can serve many vendors through its fields (for
 * example a `baseUrl` + `apiKey` pair for every OpenAI-compatible API).
 */
export interface IConnectionTypeDefinition<TResolved = unknown> {
  // `^[a-z][a-zA-Z0-9]{0,39}$`
  id: string;
  label: string;
  description?: string;
  // erxes-ui icon name (Tabler), e.g. `IconSparkles`.
  icon: string;
  fields: IConnectionFieldDefinition[];
  // Lets the user add their own keys and mark each one secret.
  allowCustomFields?: boolean;
  // Runs in the registering service when a user clicks "Test connection".
  test?: (
    connection: IConnectionValue,
    context: IConnectionResolverContext,
  ) => Promise<IConnectionTestResult> | IConnectionTestResult;
  // Runs in the reading service (`resolveConnection`) to build the client or
  // config the consumer needs.
  resolve?: (
    connection: IConnectionValue,
    context: IConnectionResolverContext,
  ) => Promise<TResolved> | TResolved;
}

/** The serializable registry entry core keeps for a type. */
export interface IConnectionTypeDescriptor {
  // Full id: `<service>:<local id>`.
  id: string;
  pluginName: string;
  label: string;
  description?: string;
  icon: string;
  fields: IConnectionFieldDefinition[];
  allowCustomFields: boolean;
  hasTest: boolean;
  hasResolve: boolean;
}

/**
 * What a service declares in `startPlugin({ meta: { connections } })`.
 * A service's server code may read connections of the types it registers
 * itself and of the full type ids it lists in `uses`; core denies the rest.
 */
export interface IConnectionsMeta {
  types?: IConnectionTypeDefinition[];
  uses?: string[];
}

/** What `initConnections` publishes to service discovery. */
export interface IConnectionsRegistration {
  types: IConnectionTypeDescriptor[];
  uses: string[];
}

export type TConnectionLookup = {
  // Full type id the connection must have, e.g. `core:custom`.
  type: string;
} & ({ connectionId: string; name?: never } | { name: string; connectionId?: never });
