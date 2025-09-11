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
	"time"

	"github.com/olivere/elastic"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

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

type Organization struct {
	ID primitive.ObjectID `bson:"_id"`
}

func fetchPlugins(url string) ([]Plugin, error) {
	resp, err := http.Get(url)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("failed to fetch plugins.json: %s", resp.Status)
	}

	data, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	var plugins Plugins
	if err := json.Unmarshal(data, &plugins); err != nil {
		return nil, err
	}

	return plugins.Plugins, nil
}

func putTemplate(index string, mapping string) {
	elasticURL := os.Getenv("ELASTICSEARCH_URL")
	client, err := elastic.NewSimpleClient(elastic.SetURL(elasticURL))
	if err != nil {
		log.Fatal(err)
	}

	analysis := `{
		"analyzer": { "uax_url_email_analyzer": { "tokenizer": "uax_url_email_tokenizer" } },
		"tokenizer": { "uax_url_email_tokenizer": { "type": "uax_url_email" } }
	}`

	body := fmt.Sprintf(`{
		"index_patterns": ["erxes__%s"],
		"settings": { "analysis": %s, "number_of_shards": 1, "number_of_replicas": 0 },
		"mappings": { "properties": %s }
	}`, index, analysis, mapping)

	res, err := client.IndexPutTemplate(index).BodyString(body).Do(context.Background())
	if err != nil {
		log.Fatal(err)
	}

	fmt.Printf("Created template %s: %+v\n", index, res)
}

func getMongoClient(uri string, maxPool uint64) (*mongo.Client, context.Context) {
	ctx := context.TODO()
	clientOpts := options.Client().
		ApplyURI(uri).
		SetMaxPoolSize(maxPool).
		SetMinPoolSize(1).
		SetConnectTimeout(10 * time.Second)

	client, err := mongo.Connect(ctx, clientOpts)
	if err != nil {
		log.Fatal(err)
	}
	return client, ctx
}

func main() {
	// Environment & Mongo URL
	maxPool := uint64(2)
	if val := os.Getenv("MaxPoolSize"); val != "" {
		fmt.Sscanf(val, "%d", &maxPool)
	}

	mongoURL := os.Getenv("MONGO_URL")
	if strings.Contains(mongoURL, "?") {
		mongoURL += "&maxPoolSize=5&minPoolSize=1&connectTimeoutMS=10000"
	} else {
		mongoURL += "?maxPoolSize=5&minPoolSize=1&connectTimeoutMS=10000"
	}

	coreMongoURL := os.Getenv("CORE_MONGO_URL")
	if strings.Contains(coreMongoURL, "?") {
		coreMongoURL += "&connect=direct"
	} else {
		coreMongoURL += "?connect=direct"
	}

	plugins, err := fetchPlugins(os.Getenv("PLUGINS_JSON_URL"))
	if err != nil {
		log.Fatal(err)
	}

	fmt.Println("Fetched plugins:", len(plugins))
	fmt.Println("Mongo URL:", mongoURL)

	nestedType := `{
		"type": "nested",
		"properties": {
			"field": { "type": "keyword" },
			"value": { "type": "object", "enabled": false },
			"stringValue": { "type": "text" },
			"numberValue": { "type": "float" },
			"dateValue": { "type": "date" }
		}
	}`

	// Create main events template
	putTemplate("events", fmt.Sprintf(`{
		"organizationId": {"type": "keyword"},
		"type": {"type": "keyword"},
		"name": {"type": "keyword"},
		"customerId": {"type": "keyword"},
		"attributes": %s
	}`, nestedType))

	// Create plugin templates
	for _, plugin := range plugins {
		for _, coll := range plugin.Collections {
			fmt.Println("Collection Name",coll.Name)
			content := strings.ReplaceAll(coll.Schema, "'", "\"")
			content = strings.ReplaceAll(content, "<nested>", nestedType)
			putTemplate(coll.Name, content)
		}
	}

	// Connect to Mongo
	client, ctx := getMongoClient(coreMongoURL, maxPool)
	defer client.Disconnect(ctx)

	orgColl := client.Database("erxes_core").Collection("organizations")
	orgIDsInterface, err := orgColl.Distinct(ctx, "_id", bson.M{})
	if err != nil {
		log.Fatal(err)
	}

	var orgIDs []string
	for _, id := range orgIDsInterface {
		if oid, ok := id.(primitive.ObjectID); ok {
			orgIDs = append(orgIDs, oid.Hex())
		}
	}

	// Generate TOML
	f, err := os.Create("mongo-elastic.toml")
	if err != nil {
		log.Fatal(err)
	}
	defer f.Close()

	elasticURL := os.Getenv("ELASTICSEARCH_URL")
	header := fmt.Sprintf(`
mongo-url="%s"
elasticsearch-urls=["%s"]
verbose=true
direct-read-concur=1


index-as-update=true
prune-invalid-json = true
direct-read-split-max = 1
elasticsearch-max-bytes = 2000000
elasticsearch-max-conns = 2
`, mongoURL, elasticURL)
	f.WriteString(header)

	// Build namespaces & scripts
	var namespaces []string
	var scripts []string
	var collections []string

	for _, plugin := range plugins {
		for _, coll := range plugin.Collections {
			scripts = append(scripts, coll.Script)
			collections = append(collections, coll.Name)
			for _, orgID := range orgIDs {
				namespaces = append(namespaces, fmt.Sprintf(`"erxes_%s.%s"`, orgID, coll.Name))
			}
		}
	}

	directReadNamespaces := strings.Join(namespaces, ",")
	collectionsRegex := strings.Join(collections, "|")
	namespaceRegex := fmt.Sprintf("^erxes_.+.(%s)$", collectionsRegex)

	// Write TOML body
	f.WriteString(fmt.Sprintf("direct-read-namespaces=[%s]\n", directReadNamespaces))
	f.WriteString(fmt.Sprintf(`
namespace-regex="%s"
routing-namespaces=[""]
delete-index-pattern="erxes_*"

[[script]]
script="""
module.exports = function(doc, ns) {
	var organizationId = ns.replace("erxes_","").split(".")[0]
	var index = ns.replace(organizationId,"").replace("_.","__");

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

	// Run Monstache
	fmt.Println("Running monstache with mongo-elastic.toml ...")
	cmd := exec.Command("monstache", "-f", "mongo-elastic.toml")
	cmd.Stdin = os.Stdin
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	cmd.Run()
}
