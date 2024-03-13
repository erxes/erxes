# Example configs.json
```json
{
    "jwt_token_secret": "token",
    "client_portal_domains": "",
    "elasticsearch": {},
    // environment variables for all back end services
    "be_env" : {
        "OTEL_TRACES_EXPORTER": "otlp",
        "OTEL_METRICS_EXPORTER": "otlp",
        "OTEL_RESOURCE_ATTRIBUTES" : "deployment.name=localhost",
        "OTEL_EXPORTER_OTLP_PROTOCOL" : "grpc",
        "OTEL_EXPORTER_OTLP_ENDPOINT" : "http://127.0.0.1:4317",
        "NODE_OPTIONS" : "--require @opentelemetry/auto-instrumentations-node/register"
    },
    "redis": {
        "password": ""
    },
    "mongo": {
        "username": "",
        "password": ""
    },
    "rabbitmq": {
        "cookie": "",
        "user": "",
        "pass": "",
        "vhost": ""
    },
    "gateway": {
        "extra_env": {
            "INTROSPECTION": "true"
        }
    },
    "plugins": [
        {
            "name": "contacts",
            "ui": "local"
        },
        {
            "name": "zzztest",
            "ui": "local"
        }
    ]
}
```