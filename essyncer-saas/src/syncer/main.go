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
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
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
	mongoURL := os.Getenv("MONGO_URL")
	coreMongoURL := os.Getenv("CORE_MONGO_URL") + "&connect=direct"
	elasticsearchURL := os.Getenv("ELASTICSEARCH_URL")

	var ctx = context.TODO()

	// Fetch plugins.json from URL
	pluginsURL := "https://pub-b4000d5767e14a6f835f4e70b3470577.r2.dev/plugins.json" // Replace with the actual URL
	byteValue, err := fetchPluginsFromURL(pluginsURL)
	if err != nil {
		log.Fatal(err)
	}

	var plugins Plugins
	if err := json.Unmarshal(byteValue, &plugins); err != nil {
		log.Fatal(err)
	}

	fmt.Println("Successfully fetched plugins.json", plugins)
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

	fmt.Println("Starting put template")

	putTemplate("events", fmt.Sprintf(`{
		"organizationId": {
			"type": "keyword"
		},
		"type": {
			"type": "keyword"
		},
		"name": {
			"type": "keyword"
		},
		"customerId": {
			"type": "keyword"
		},
    	"attributes" : %s
	}`, nested_type))

	for i := 0; i < len(plugins.Plugins); i++ {
		var collections = plugins.Plugins[i].Collections

		for j := 0; j < len(collections); j++ {
			var collection = collections[j]
			var content = strings.Replace(collection.Schema, "'", "\"", -1)
			content = strings.Replace(content, "<nested>", nested_type, -1)
			putTemplate(collection.Name, content)
		}
	}

	// Set client options
	clientOptions := options.Client().ApplyURI(coreMongoURL)

	// Connect to MongoDB
	client, err := mongo.Connect(ctx, clientOptions)

	if err != nil {
		log.Fatal(err)
	}

	defer client.Disconnect(ctx)

	organizationsCollection := client.Database("erxes_core").Collection("organizations")

	findOptions := options.Find()

	cursor, err := organizationsCollection.Find(ctx, bson.M{}, findOptions)

	if err != nil {
		log.Fatal(err)
	}

	type Organization struct {
		ID primitive.ObjectID `bson:"_id"`
	}

	var organizations []Organization

	if err = cursor.All(ctx, &organizations); err != nil {
		log.Fatal(err)
	}

	fmt.Println("Creating mongo-elastic.toml file", coreMongoURL, len(organizations))

	f, _ := os.Create("mongo-elastic.toml")

	var header = fmt.Sprintf(`
		mongo-url="%s"
		elasticsearch-urls=["%s"]
		verbose=true
	`, mongoURL, elasticsearchURL)

	f.WriteString(header)

	var namespaces []string
	var scripts []string

	var possible_dbs []string
	var possible_collections []string

	for i := 0; i < len(organizations); i++ {
		var organization = organizations[i]
		var orgID = organization.ID.Hex()

		possible_dbs = append(possible_dbs, fmt.Sprintf(`erxes_%s`, orgID))
	}

	for i := 0; i < len(plugins.Plugins); i++ {
		var plugin = plugins.Plugins[i]
		var collections = plugin.Collections

		for j := 0; j < len(collections); j++ {
			var collection = collections[j]

			scripts = append(scripts, collection.Script)

			possible_collections = append(possible_collections, collection.Name)

			for i := 0; i < len(organizations); i++ {
				var organization = organizations[i]
				var orgID = organization.ID.Hex()
		
				namespaces = append(namespaces, fmt.Sprintf(`"erxes_%s.%s"`, orgID, collection.Name))
			}

		}
	}

	var possible_collections_str = strings.Join(possible_collections, "|")

	var namespace_regex = fmt.Sprintf("^erxes_.+.(%s)", possible_collections_str)

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
	`, namespace_regex, strings.Join(scripts, " ")))

	f.Close()

	fmt.Println("Before mongo-elastic.toml run")

	cmd := exec.Command("monstache", "-f", "mongo-elastic.toml")

	cmd.Stdin = os.Stdin
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr

	cmd.Run()

	fmt.Println("Running mongo-elastic.toml")
}