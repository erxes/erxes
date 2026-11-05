// The one piece of the workerd runtime the SDK touches. Extensions are
// bundled with `cloudflare:workers` left external, so workerd supplies it.
declare module 'cloudflare:workers' {
  export abstract class WorkerEntrypoint<Env = unknown> {
    protected env: Env;
  }
}
