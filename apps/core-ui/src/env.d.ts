/// <reference types="@rsbuild/core/types" />

interface ImportMetaEnv {
  /**
   * Plugin UIs to load, comma-separated `<remote>@<remoteEntry url>`, e.g.
   * `hr_ui@http://localhost:3025/remoteEntry.js`. Replaced by the plugin
   * registry API in a later slice.
   */
  readonly PUBLIC_PLUGINS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
