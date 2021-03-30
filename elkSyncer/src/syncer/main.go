package main

import (
	"context"
	"fmt"
	"log"
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

func main() {
	mongoURL := os.Getenv("MONGO_URL")
	elasticsearchURL := os.Getenv("ELASTICSEARCH_URL")

	log.Println("sjdklajdklsjkl")

	fmt.Println("Mongo url ", mongoURL)
	fmt.Println("Elasticsearch url ", elasticsearchURL)

	var ctx = context.TODO()

	var nested_type = `{
		"type" : "nested",
		"properties" : {
			"field": {
				"type": "keyword"
			},
			"value" : {
				"type": "text"
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

	putTemplate("customers", fmt.Sprintf(`{
		"createdAt": {
			"type": "date"
		},
		"organizationId": {
			"type": "keyword"
		},
		"state": {
			"type": "keyword"
		},
		"primaryEmail": {
			"type": "text",
			"analyzer": "uax_url_email_analyzer"
		},
		"primaryPhone": {
			"type": "text",
			"fields": {
				"raw": {
					"type": "keyword"
				}
			}
		},
		"code": {
			"type": "text",
			"fields": {
				"raw": {
					"type": "keyword"
				}
			}
		},
		"integrationId": {
			"type": "keyword"
		},
		"relatedIntegrationIds": {
			"type": "keyword"
		},
		"scopeBrandIds": {
			"type": "keyword"
		},
		"ownerId": {
			"type": "keyword"
		},
		"position": {
			"type": "keyword"
		},
		"leadStatus": {
			"type": "keyword"
		},
		"tagIds": {
			"type": "keyword"
		},
		"companyIds": {
			"type": "keyword"
		},
		"mergedIds": {
			"type": "keyword"
		},
		"status": {
			"type": "keyword"
		},
		"emailValidationStatus": {
			"type": "keyword"
		},
		"customFieldsData": %s,
		"trackedData": %s
	}`, nested_type, nested_type))

	putTemplate("companies", fmt.Sprintf(`{
		"createdAt": {
			"type": "date"
		},
		"primaryEmail": {
			"type": "text",
			"analyzer": "uax_url_email_analyzer"
		},
		"primaryName": {
			"type": "text",

			"fields": {
				"raw": {
					"type": "keyword"
				}
			}
		},
		"scopeBrandIds": {
			"type": "keyword"
		},
		"plan": {
			"type": "keyword"
		},
		"industry": {
			"type": "keyword"
		},
		"parentCompanyId": {
			"type": "keyword"
		},
		"ownerId": {
			"type": "keyword"
		},
		"tagIds": {
			"type": "keyword"
		},
		"mergedIds": {
			"type": "keyword"
		},
		"status": {
			"type": "keyword"
		},
		"businessType": {
			"type": "keyword"
		},
		"customFieldsData" : %s
	}`, nested_type))

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

	// // Set client options
	// clientOptions := options.Client().ApplyURI(coreMongoURL)

	// // Connect to MongoDB
	// client, err := mongo.Connect(ctx, clientOptions)

	// if err != nil {
	// 	log.Fatal(err)
	// }

	// defer client.Disconnect(ctx)

	// organizationsCollection := client.Database("erxes_core").Collection("organizations")

	// findOptions := options.Find()

	// cursor, err := organizationsCollection.Find(ctx, bson.M{}, findOptions)

	// type Organization struct {
	// 	ID primitive.ObjectID `bson:"_id"`
	// }

	// var organizations []Organization

	// cursor.All(ctx, &organizations)

	f, _ := os.Create("mongo-elastic.toml")

	var header = fmt.Sprintf(`
		mongo-url="%s"
		elasticsearch-urls=["%s"]
		verbose=true
	`, mongoURL, elasticsearchURL)

	f.WriteString(header)

	var namespaces []string


		namespaces = append(namespaces, fmt.Sprintf(`"erxes_%s.customers"`))
		namespaces = append(namespaces, fmt.Sprintf(`"erxes_%s.companies"`))
		namespaces = append(namespaces, fmt.Sprintf(`"erxes_%s.conversations"`))
		namespaces = append(namespaces, fmt.Sprintf(`"erxes_%s.integrations"`))
		namespaces = append(namespaces, fmt.Sprintf(`"erxes_%s.deals"`))
		namespaces = append(namespaces, fmt.Sprintf(`"erxes_%s.tickets"`))
		namespaces = append(namespaces, fmt.Sprintf(`"erxes_%s.tasks"`))
		namespaces = append(namespaces, fmt.Sprintf(`"erxes_%s.channels"`))
		namespaces = append(namespaces, fmt.Sprintf(`"erxes_%s.users"`))
		namespaces = append(namespaces, fmt.Sprintf(`"erxes_%s.stages"`))
		namespaces = append(namespaces, fmt.Sprintf(`"erxes_%s.pipelines"`))
		namespaces = append(namespaces, fmt.Sprintf(`"erxes_%s.brands"`))
		namespaces = append(namespaces, fmt.Sprintf(`"erxes_%s.segments"`))
		namespaces = append(namespaces, fmt.Sprintf(`"erxes_%s.conversation_messages"`))
		namespaces = append(namespaces, fmt.Sprintf(`"erxes_%s.engage_messages"`))
		namespaces = append(namespaces, fmt.Sprintf(`"erxes_%s.tags"`))


	f.WriteString(`
		index-as-update=true
		prune-invalid-json = true
		direct-read-split-max = 1
		elasticsearch-max-bytes = 2000000
		elasticsearch-max-conns = 2
	`)

	f.WriteString(fmt.Sprintf("direct-read-namespaces=[%s]", strings.Join(namespaces, ",")))

	f.WriteString(`
		namespace-regex = "^erxes_.+.(customers|companies|conversations|conversation_messages|integrations|deals|tasks|tickets|brands|users|channels|stages|pipelines|segments|engage_messages|tags)$"
		routing-namespaces = [ "" ]
		delete-index-pattern = "erxes_*"

		[[script]]
		script = """
		module.exports = function(doc, ns) {
			var organizationId = ns.replace("erxes_","").split(".")[0]

			var index = ns.replace(organizationId, "").replace("_.", "__");
			
			if (ns.indexOf("customers") > -1) {
				if (doc.urlVisits) {
					delete doc.urlVisits
				}

				if (doc.trackedDataBackup) {
					delete doc.trackedDataBackup
				}

				if (doc.customFieldsDataBackup) {
					delete doc.customFieldsDataBackup
				}

				if (doc.messengerData) {
					delete doc.messengerData
				}	
			}

			doc._meta_monstache = {
				id: doc._id.toString(),
				index: index
			};


			return doc;
		}
		"""
	`)

	f.Close()

	cmd := exec.Command("monstache", "-f", "mongo-elastic.toml")

	cmd.Stdin = os.Stdin
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr

	cmd.Run()
}
