# Template. launch.ts fills in the three placeholder values and writes the result
# next to supervisor.js in a temp dir before starting workerd.
using Workerd = import "/workerd/workerd.capnp";

const config :Workerd.Config = (
  services = [
    ( name = "supervisor",
      worker = (
        modules = [
          (name = "supervisor.js", esModule = embed "supervisor.js"),
        ],
        compatibilityDate = "2025-09-01",
        compatibilityFlags = ["nodejs_compat", "enable_ctx_exports", "experimental"],
        bindings = [
          (name = "loader", workerLoader = ()),
          (name = "RUNTIME", service = "runtime"),
          (name = "TOKEN", text = "__TOKEN__"),
        ],
        # Supervisor itself gets no internet. Only the RUNTIME binding is reachable.
        globalOutbound = (name = "supervisor", entrypoint = "blockedOutbound"),
      )
    ),
    ( name = "runtime",
      external = (address = "127.0.0.1:__HOST_PORT__", http = ()),
    ),
  ],
  sockets = [
    ( name = "http",
      address = "127.0.0.1:__SUPERVISOR_PORT__",
      http = (),
      service = "supervisor",
    ),
  ],
);
