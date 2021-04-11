package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"os/exec"
	"strings"

	"github.com/olivere/elastic"
)

func putTemplate(indexSuffix string, mapping string) {
	elasticsearchURL := os.Getenv("ELASTICSEARCH_URL")
	dbName := os.Getenv("DB_NAME")

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
			"index_patterns": ["%s__%s"],
			"settings": {
				"analysis": %s,
				"number_of_shards": 1,
				"number_of_replicas": 0
			},
			"mappings": {
				"properties": %s
			}
		}
	`,dbName, indexSuffix, analysis, mapping)

	putResponse, err := client.IndexPutTemplate(indexSuffix).BodyString(bodyString).Do(context.Background())

	if err != nil {
		log.Fatal(err)
	}

	fmt.Println(`Create %s template response`, indexSuffix, putResponse)
}

func main() {
	mongoURL := os.Getenv("MONGO_URL")
	elasticsearchURL := os.Getenv("ELASTICSEARCH_URL")
	dbName := os.Getenv("DB_NAME")


	fmt.Println("Mongo url ", mongoURL)
	fmt.Println("Elasticsearch url ", elasticsearchURL)
	fmt.Println("Db name ", dbName)

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
	putTemplate("conversations", fmt.Sprintf(`{
    	"customFieldsData" : %s
	}`, nested_type))

	putTemplate("conformities", fmt.Sprintf(`{
		"mainType": {
			"type": "keyword"
		},
		"mainTypeId": {
			"type": "keyword"
		},
		"relType": {
			"type": "keyword"
		},
		"relTypeId": {
			"type": "keyword"
		}
	}`))


	f, _ := os.Create("mongo-elastic.toml")

	var header = fmt.Sprintf(`
		mongo-url="%s"
		elasticsearch-urls=["%s"]
		verbose=true
	`, mongoURL, elasticsearchURL)

	f.WriteString(header)

	var namespaces []string


		namespaces = append(namespaces, fmt.Sprintf(`"%s.customers"`, dbName))
		namespaces = append(namespaces, fmt.Sprintf(`"%s.companies"`, dbName))
		namespaces = append(namespaces, fmt.Sprintf(`"%s.conversations"`, dbName))
		namespaces = append(namespaces, fmt.Sprintf(`"%s.integrations"`, dbName))
		namespaces = append(namespaces, fmt.Sprintf(`"%s.deals"`, dbName))
		namespaces = append(namespaces, fmt.Sprintf(`"%s.tickets"`, dbName))
		namespaces = append(namespaces, fmt.Sprintf(`"%s.tasks"`, dbName))
		namespaces = append(namespaces, fmt.Sprintf(`"%s.channels"`, dbName))
		namespaces = append(namespaces, fmt.Sprintf(`"%s.users"`, dbName))
		namespaces = append(namespaces, fmt.Sprintf(`"%s.stages"`, dbName))
		namespaces = append(namespaces, fmt.Sprintf(`"%s.pipelines"`, dbName))
		namespaces = append(namespaces, fmt.Sprintf(`"%s.brands"`, dbName))
		namespaces = append(namespaces, fmt.Sprintf(`"%s.segments"`, dbName))
		namespaces = append(namespaces, fmt.Sprintf(`"%s.conversation_messages"`, dbName))
		namespaces = append(namespaces, fmt.Sprintf(`"%s.engage_messages"`, dbName))
		namespaces = append(namespaces, fmt.Sprintf(`"%s.tags"`, dbName))
		namespaces = append(namespaces, fmt.Sprintf(`"%s.fields"`, dbName))
		namespaces = append(namespaces, fmt.Sprintf(`"%s.fields_groups"`, dbName))
		namespaces = append(namespaces, fmt.Sprintf(`"%s.conformities"`, dbName))


	f.WriteString(`
		index-as-update=true
		prune-invalid-json = true
		direct-read-split-max = 1
		elasticsearch-max-bytes = 2000000
		elasticsearch-max-conns = 2
	`)

	f.WriteString(fmt.Sprintf("direct-read-namespaces=[%s]", strings.Join(namespaces, ",")))

	f.WriteString(fmt.Sprintf(`
		namespace-regex = "^%s.(customers|companies|conversations|conversation_messages|integrations|deals|tasks|tickets|brands|users|channels|stages|pipelines|segments|engage_messages|tags|fields|fields_groups|conformities)$"
		routing-namespaces = [ "" ]
		delete-index-pattern = "%s*"

		[[script]]
		script = """
		module.exports = function(doc, ns) {
			var index = ns.replace(".", "__");

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

			doc.ownId = doc._id

			return doc;
		}
		"""
	`, dbName, dbName))

	f.Close()

	cmd := exec.Command("monstache", "-f", "mongo-elastic.toml")

	cmd.Stdin = os.Stdin
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr

	cmd.Run()
}
