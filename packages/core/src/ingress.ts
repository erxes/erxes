import * as k8s from "@kubernetes/client-node";

// prod-saas
const NAMESPACE = "saas-prod";

export const configNginx = async (subdomain: string, hostname: string) => {
  const kc = new k8s.KubeConfig();
  kc.loadFromDefault();

  const k8sApi = kc.makeApiClient(k8s.NetworkingV1Api);
  const clientIdentifier = subdomain;

  return k8sApi
    .createNamespacedIngress(NAMESPACE, {
      apiVersion: "networking.k8s.io/v1",
      kind: "Ingress",
      metadata: {
        name: `custom-${clientIdentifier}`,
        annotations: {
          "nginx.ingress.kubernetes.io/proxy-body-size": "30m",
          "nginx.ingress.kubernetes.io/proxy-connect-timeout": "180",
          "nginx.ingress.kubernetes.io/proxy-read-timeout": "180",
          "nginx.ingress.kubernetes.io/configuration-snippet": `
                more_set_headers "server: hide";
                more_set_headers "X-Content-Type-Options: nosniff";
                more_set_headers "X-Xss-Protection: 1; mode=block";
              `
        },
        labels: {
          "managed-by": "core-api"
        }
      },
      spec: {
        ingressClassName: "nginx",
        rules: [
          {
            host: hostname,
            http: {
              paths: [
                {
                  backend: {
                    service: { name: `core-ui`, port: { number: 80 } }
                  },
                  path: "/",
                  pathType: "Prefix"
                }
              ]
            }
          }
        ],
        tls: [
          {
            hosts: [hostname]
          }
        ]
      }
    })
    .catch(err => {
      console.error(err);
      throw new Error(err);
    });
};

export const deleteNginx = async (subdomain: string) => {
  const kc = new k8s.KubeConfig();
  kc.loadFromDefault();

  const k8sApi = kc.makeApiClient(k8s.NetworkingV1Api);
  const clientIdentifier = subdomain;

  return k8sApi
    .deleteNamespacedIngress(`custom-${clientIdentifier}`, NAMESPACE)
    .catch(err => {
      throw new Error(err);
    });
};
