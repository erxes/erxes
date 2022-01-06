package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"encoding/json"
	"io/ioutil"
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

	fmt.Println(`Create %s template response`, indexSuffix, putResponse)
}

type Plugins struct {
	Plugins []Plugin `json:"plugins"`
}
    
type Plugin struct {
	Db_name   string `json:"db_name"`
	Script   string `json:"script"`
	Collections []Collection `json:"collections"`
}

type Collection struct {
	Name   string `json:"name"`
	Schema string `json:"schema"`
	Script string `json:"script"`
}

func main() {
	mongoURL := os.Getenv("MONGO_URL")
	elasticsearchURL := os.Getenv("ELASTICSEARCH_URL")

	jsonFile, err := os.Open("/data/essyncerData/plugins.json")

	// if we os.Open returns an error then handle it
	if err != nil {
		fmt.Println(err)
	}

	// defer the closing of our jsonFile so that we can parse it later on
	defer jsonFile.Close()

	byteValue, _ := ioutil.ReadAll(jsonFile)

	var plugins Plugins
	json.Unmarshal([]byte(byteValue), &plugins)

	fmt.Println("Successfully Opened plugins.json", plugins)
	fmt.Println("Mongo url ", mongoURL)
	fmt.Println("Elasticsearch url ", elasticsearchURL)

	var nested_type = `{
		"type" : "nested",
		"properties" : {
			"field": {
				"type": "keyword"
			},
			"value" : {
				"type": "object",
				"enabled" : false
			},
			"stringValue": {
				"type" : "text"
			},
			"numberValue": {
				"type" : "float"
			},
			"dateValue": {
				"type" : "date" 
			}
		}
	}`

	for i := 0; i < len(plugins.Plugins); i++ {
		var collections = plugins.Plugins[i].Collections

		for j := 0; j < len(collections); j++ {
			var collection = collections[i]
			var content = strings.Replace(collection.Schema, "'", "\"", -1)
			content = strings.Replace(content, "<nested>", nested_type, -1)
			putTemplate(collection.Name, content)
		}
	}

	var itemTemplate = fmt.Sprintf(`{
		"userId": {
			"type": "keyword"
		},
		"stageId": {
			"type": "keyword"
		},
		"modifiedBy": {
			"type": "keyword"
		},
		"status": {
			"type": "keyword"
		},
		"assignedUserIds": {
			"type": "keyword"
		},
		"watchedUserIds": {
			"type": "keyword"
		},
		"labelIds": {
			"type": "keyword"
		},
		"customFieldsData": %s
	}`, nested_type)

	putTemplate("deals", itemTemplate)

	putTemplate("tasks", itemTemplate)

	putTemplate("tickets", itemTemplate)

	f, _ := os.Create("mongo-elastic.toml")

	var header = fmt.Sprintf(`
		mongo-url="%s"
		elasticsearch-urls=["%s"]
		verbose=true
	`, mongoURL, elasticsearchURL)

	f.WriteString(header)

	var namespaces []string

	namespaces = append(namespaces, fmt.Sprintf(`"erxes.deals"`))
	namespaces = append(namespaces, fmt.Sprintf(`"erxes.tickets"`))
	namespaces = append(namespaces, fmt.Sprintf(`"erxes.tasks"`))


	var scripts []string
	possible_dbs := []string{"erxes"}
	possible_collections := []string{"deals","tasks","tickets"}

	for i := 0; i < len(plugins.Plugins); i++ {
		var plugin = plugins.Plugins[i]
		var collections = plugin.Collections

		possible_dbs = append(possible_dbs, plugin.Db_name)

		for j := 0; j < len(collections); j++ {
			var collection = collections[i]

			scripts = append(scripts, collection.Script)

			possible_collections = append(possible_collections, collection.Name)

			namespaces = append(namespaces, fmt.Sprintf(`"%s.%s"`, plugin.Db_name, collection.Name))
		}
	}

	var possible_dbs_str = strings.Join(possible_dbs, "|")
	var possible_collections_str = strings.Join(possible_collections, "|")

	var namespace_regex = fmt.Sprintf("(%s).(%s)", possible_dbs_str, possible_collections_str)

	f.WriteString(`
		index-as-update=true
		prune-invalid-json = true
		direct-read-split-max = 1
		elasticsearch-max-bytes = 2000000
		elasticsearch-max-conns = 2
	`)

	f.WriteString(fmt.Sprintf("direct-read-namespaces=[%s]", strings.Join(namespaces, ",")))

	f.WriteString(fmt.Sprintf(`
		namespace-regex = "^%s$"
		routing-namespaces = [ "" ]
		delete-index-pattern = "erxes*"

		[[script]]
		script = """
		module.exports = function(doc, ns) {
			var index = ns.replace(".", "__");

			if (ns.indexOf("_") > -1) {
				index = ns.split("_")[0] + "__" + ns.split(".")[1];
			}

			%s

			doc._meta_monstache = {
				id: doc._id.toString(),
				index: index
			};

			doc.ownId = doc._id

			return doc;
		}
		"""
	`, namespace_regex, strings.Join(scripts, " ")))

	f.Close()

	cmd := exec.Command("monstache", "-f", "mongo-elastic.toml")

	cmd.Stdin = os.Stdin
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr

	cmd.Run()
}
