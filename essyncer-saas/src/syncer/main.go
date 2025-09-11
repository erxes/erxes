package main

import (
	"context"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"os/exec"
	"strings"

	"github.com/olivere/elastic"
)

func putTemplate(indexSuffix string, mapping string) {
	elasticsearchURL := os.Getenv("ELASTICSEARCH_URL")

	client, err := elastic.NewSimpleClient(elastic.SetURL(elasticsearchURL))
	if err != nil {
		log.Fatal(err)
	}

	var analysis = `{
		"analyzer": {
			"uax_url_email_analyzer": {
				"tokenizer": "uax_url_email_tokenizer"
			}
		},
		"tokenizer": {
			"uax_url_email_tokenizer": {
				"type": "uax_url_email"
			}
		}
	}`

	var bodyString = fmt.Sprintf(`
		{
			"index_patterns": ["erxes__%s"],
			"settings": {
				"analysis": %s,
				"number_of_shards": 1,
				"number_of_replicas": 0
			},
			"mappings": {
				"properties": %s
			}
		}
	`, indexSuffix, analysis, mapping)

	putResponse, err := client.IndexPutTemplate(indexSuffix).BodyString(bodyString).Do(context.Background())
	if err != nil {
		log.Fatal(err)
	}

	fmt.Printf("Created %s template: %+v\n", indexSuffix, putResponse)
}

type Plugins struct {
	Plugins []Plugin `json:"plugins"`
}

type Plugin struct {
	Db_name     string       `json:"db_name"`
	Script      string       `json:"script"`
	Collections []Collection `json:"collections"`
}

type Collection struct {
	Name   string `json:"name"`
	Schema string `json:"schema"`
	Script string `json:"script"`
}

func fetchPluginsFromURL(url string) ([]byte, error) {
	resp, err := http.Get(url)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("failed to fetch plugins.json: %s", resp.Status)
	}

	return ioutil.ReadAll(resp.Body)
}

func main() {
	// Pool size defaults
	maxPoolSize := os.Getenv("MaxPoolSize")
	if maxPoolSize == "" {
		maxPoolSize = "5"
	}
	mongoParams := "maxPoolSize=" + maxPoolSize + "&minPoolSize=1&connectTimeoutMS=10000"

	// Mongo URL
	mongoURL := os.Getenv("MONGO_URL")
	if strings.Contains(mongoURL, "?") {
		mongoURL = mongoURL + "&" + mongoParams
	} else {
		mongoURL = mongoURL + "?" + mongoParams
	}

	// Plugin definitions
	pluginsURL := os.Getenv("PLUGINS_JSON_URL")
	byteValue, err := fetchPluginsFromURL(pluginsURL)
	if err != nil {
		log.Fatal(err)
	}

	var plugins Plugins
	if err := json.Unmarshal(byteValue, &plugins); err != nil {
		log.Fatal(err)
	}

	fmt.Println("Fetched plugins.json successfully")
	fmt.Println("Mongo URL:", mongoURL)

	// Shared nested type
	var nestedType = `{
		"type" : "nested",
		"properties" : {
			"field": { "type": "keyword" },
			"value": { "type": "object", "enabled": false },
			"stringValue": { "type": "text" },
			"numberValue": { "type": "float" },
			"dateValue": { "type": "date" }
		}
	}`

	// Events template
	putTemplate("events", fmt.Sprintf(`{
		"organizationId": { "type": "keyword" },
		"type": { "type": "keyword" },
		"name": { "type": "keyword" },
		"customerId": { "type": "keyword" },
		"attributes": %s
	}`, nestedType))

	// Plugin templates
	for _, plugin := range plugins.Plugins {
		for _, collection := range plugin.Collections {
			content := strings.Replace(collection.Schema, "'", "\"", -1)
			content = strings.Replace(content, "<nested>", nestedType, -1)
			putTemplate(collection.Name, content)
		}
	}

	// Build TOML
	f, _ := os.Create("mongo-elastic.toml")

	var header = fmt.Sprintf(`
mongo-url="%s"
elasticsearch-urls=["%s"]
verbose=true

index-as-update=true
prune-invalid-json = true
direct-read-split-max = 1
elasticsearch-max-bytes = 2000000
elasticsearch-max-conns = 2
`, mongoURL, os.Getenv("ELASTICSEARCH_URL"))

	f.WriteString(header)

	// Collect collections + scripts
	var collections []string
	var scripts []string

	for _, plugin := range plugins.Plugins {
		for _, collection := range plugin.Collections {
			collections = append(collections, collection.Name)
			scripts = append(scripts, collection.Script)
		}
	}

	// Regex for all org DBs
	collectionsStr := strings.Join(collections, "|")
	namespaceRegex := fmt.Sprintf("^erxes_.+.(%s)$", collectionsStr)

	f.WriteString(fmt.Sprintf(`
namespace-regex = "%s"
routing-namespaces = [ "" ]
delete-index-pattern = "erxes_*"

[[script]]
script = """
module.exports = function(doc, ns) {
	var organizationId = ns.replace("erxes_","").split(".")[0]
	var index = ns.replace(organizationId, "").replace("_.", "__");

	%s

	doc._meta_monstache = {
		id: organizationId + '__' + doc._id.toString(),
		index: index
	};

	doc.organizationId = organizationId;

	return doc;
}
"""
`, namespaceRegex, strings.Join(scripts, "\n")))

	f.Close()

	// Run Monstache
	fmt.Println("Running monstache with mongo-elastic.toml ...")
	cmd := exec.Command("monstache", "-f", "mongo-elastic.toml")
	cmd.Stdin = os.Stdin
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	cmd.Run()
}
