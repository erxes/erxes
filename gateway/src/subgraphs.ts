import { ServiceEndpointDefinition } from '@apollo/gateway/src/config';
import * as dotenv from 'dotenv';
dotenv.config();

interface SubgraphConfig {
  name: string;
  urlEnvKey : string;
}

const allSubgraphConfigs: SubgraphConfig[] = [
  {
    name : "api",
    urlEnvKey : "SUBGRAPH_API_URL"
  }
]

export function getConfiguredServices(): ServiceEndpointDefinition[] {
  const configuredServices: ServiceEndpointDefinition[] = [];

  for(const subgraphConfig of allSubgraphConfigs) {
    const url = process.env[subgraphConfig.urlEnvKey];
  
    // this subgraph's url is not configured in environment variables
    if(!url) continue;
  
    configuredServices.push({
      name: subgraphConfig.name,
      url
    })
  }

  return configuredServices;
}