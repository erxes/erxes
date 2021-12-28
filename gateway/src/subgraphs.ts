import * as dotenv from 'dotenv';
dotenv.config();

const possibleSubgraphs: { name: string; urlEnvKey: string; }[] = [
  {
    name : "api",
    urlEnvKey : "SUBGRAPH_API_URL"
  }
]

export function getAvailableServiceList(): { name: string; url: string }[] {
  const availableServiceList = [];

  for(const possibleSubgraph of possibleSubgraphs) {
    const url = process.env[possibleSubgraph.urlEnvKey];
  
    // this subgraph is not configured in environment variables
    if(!url) continue;
  
    availableServiceList.push({
      name: possibleSubgraph.name,
      url
    })
  }

  return availableServiceList;
}