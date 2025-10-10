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
	"sync"
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


	// Template created
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

func processBatch(start, end int, orgIDs []string, plugins []Plugin, scripts []string, mongoURL, elasticURL string, wg *sync.WaitGroup, results chan error) {
	defer wg.Done()
	
	// Build namespaces for this batch
	var batchNamespaces []string
	for _, plugin := range plugins {
		for _, coll := range plugin.Collections {
			for _, orgID := range orgIDs[start:end] {
				batchNamespaces = append(batchNamespaces, fmt.Sprintf(`"erxes_%s.%s"`, orgID, coll.Name))
			}
		}
	}

	// Create TOML per batch
	f, err := os.Create(fmt.Sprintf("mongo-elastic-batch-%d-%d.toml", start, end-1))
	if err != nil {
		results <- err
		return
	}

	// Prepare TOML header template - Ultra-conservative for 2vCPU/4GB Elasticsearch
	header := fmt.Sprintf(`
    mongo-url="%s"
    elasticsearch-urls=["%s"]
    verbose=false
    resume=true
    direct-read-concur=4
    
    index-as-update=true
    prune-invalid-json = true
    direct-read-split-max = 4
    elasticsearch-max-bytes = 5000000
    elasticsearch-max-conns = 8
    elasticsearch-bulk-actions = 1000
    elasticsearch-bulk-size = 5
    elasticsearch-bulk-flush-interval = "2s"
    `, mongoURL, elasticURL)

	// Write header
	f.WriteString(header)

	// Write multi-line namespaces for better parser performance
	f.WriteString("direct-read-namespaces=[\n")
	for _, ns := range batchNamespaces {
		f.WriteString(fmt.Sprintf("%s,\n", ns))
	}
	f.WriteString("]\n")

	// Write remaining TOML and script
	f.WriteString(fmt.Sprintf(`
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
    `, strings.Join(scripts, "\n")))

	f.Close()

	// Run Monstache with conservative settings and retries for this batch
	maxRetries := 3
	var runErr error
	for attempt := 1; attempt <= maxRetries; attempt++ {
		// Running monstache for batch
		// Add performance flags to monstache command with conservative settings
		cmd := exec.Command("monstache", "-f", fmt.Sprintf("mongo-elastic-batch-%d-%d.toml", start, end-1), "-log-level", "warn")
		cmd.Stdin = os.Stdin
		cmd.Stdout = os.Stdout
		cmd.Stderr = os.Stderr
		runErr = cmd.Run()
		// Batch completed
		if runErr == nil {
			break
		}
		// Longer backoff for retries to give servers time to recover
		time.Sleep(time.Duration(attempt*attempt) * 10 * time.Second)
	}
	
	// Clean up the temporary file
	os.Remove(fmt.Sprintf("mongo-elastic-batch-%d-%d.toml", start, end-1))
	
	results <- runErr
}

func main() {
	// Environment & Mongo URL - Ultra-conservative limits for 16vCPU/32GB MongoDB
	maxPool := uint64(10) // Very conservative for 16vCPU/32GB MongoDB
	if val := os.Getenv("MaxPoolSize"); val != "" {
		fmt.Sscanf(val, "%d", &maxPool)
	}

	mongoURL := os.Getenv("MONGO_URL")
	if strings.Contains(mongoURL, "?") {
		mongoURL += "&maxPoolSize=20&minPoolSize=5&connectTimeoutMS=10000&maxIdleTimeMS=30000&serverSelectionTimeoutMS=10000&maxConnecting=5"
	} else {
		mongoURL += "?maxPoolSize=20&minPoolSize=5&connectTimeoutMS=10000&maxIdleTimeMS=30000&serverSelectionTimeoutMS=10000&maxConnecting=5"
	}

	coreMongoURL := os.Getenv("CORE_MONGO_URL")
	if strings.Contains(coreMongoURL, "?") {
		coreMongoURL += "&connect=direct&maxPoolSize=15&minPoolSize=3&connectTimeoutMS=10000&maxConnecting=3"
	} else {
		coreMongoURL += "?connect=direct&maxPoolSize=15&minPoolSize=3&connectTimeoutMS=10000&maxConnecting=3"
	}

	plugins, err := fetchPlugins(os.Getenv("PLUGINS_JSON_URL"))
	if err != nil {
		log.Fatal(err)
	}

	fmt.Println("Fetched plugins:", len(plugins))

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
			content := strings.ReplaceAll(coll.Schema, "'", "\"")
			content = strings.ReplaceAll(content, "<nested>", nestedType)
			putTemplate(coll.Name, content)
		}
	}

	// Connect to Mongo
	client, ctx := getMongoClient(coreMongoURL, maxPool)
	defer client.Disconnect(ctx)

	orgColl := client.Database("erxes_core").Collection("organizations")
	sixMonthsAgo := time.Now().AddDate(0, -6, 0)
	orgIDsInterface, err := orgColl.Distinct(ctx, "_id", bson.M{"lastActiveDate": bson.M{
            "$gte": sixMonthsAgo,
        }})
	if err != nil {
		log.Fatal(err)
	}

	var orgIDs []string
	for _, id := range orgIDsInterface {
		if oid, ok := id.(primitive.ObjectID); ok {
			orgIDs = append(orgIDs, oid.Hex())
		}
	}

	fmt.Println("Fetched organizations:", len(orgIDs))


    // Get Elasticsearch URL for batch processing
    elasticURL := os.Getenv("ELASTICSEARCH_URL")

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

    // Batching optimized for 4k databases with 46GB data
    // Smaller batches to avoid memory issues with large datasets
    batchSize := 200 // Optimized for 4k databases - smaller batches prevent memory overflow
    if v := os.Getenv("BATCH_SIZE"); v != "" {
        fmt.Sscanf(v, "%d", &batchSize)
    }

    // Process batches in parallel - ultra-conservative for server protection
    maxConcurrentBatches := 2 // Very conservative to protect both MongoDB and Elasticsearch
    if v := os.Getenv("MAX_CONCURRENT_BATCHES"); v != "" {
        fmt.Sscanf(v, "%d", &maxConcurrentBatches)
    }
    
    var wg sync.WaitGroup
    results := make(chan error, maxConcurrentBatches)
    semaphore := make(chan struct{}, maxConcurrentBatches)
    
    fmt.Printf("Processing %d organizations in batches of %d with %d concurrent workers\n", 
        len(orgIDs), batchSize, maxConcurrentBatches)
    
    // Track progress for large dataset
    var completedBatches int32
    var totalBatches = int32((len(orgIDs) + batchSize - 1) / batchSize)
    startTime := time.Now()
    
    for start := 0; start < len(orgIDs); start += batchSize {
        end := start + batchSize
        if end > len(orgIDs) {
            end = len(orgIDs)
        }
        
        // Acquire semaphore
        semaphore <- struct{}{}
        wg.Add(1)
        
        go func(s, e int) {
            defer func() { 
                <-semaphore // Release semaphore
                completedBatches++
                if completedBatches%10 == 0 || completedBatches == totalBatches {
                    elapsed := time.Since(startTime)
                    rate := float64(completedBatches) / elapsed.Minutes()
                    remaining := float64(totalBatches-completedBatches) / rate
                    fmt.Printf("Progress: %d/%d batches (%.1f%%) - Rate: %.1f batches/min - ETA: %.1f min\n", 
                        completedBatches, totalBatches, 
                        float64(completedBatches)/float64(totalBatches)*100, 
                        rate, remaining)
                }
            }()
            processBatch(s, e, orgIDs, plugins, scripts, mongoURL, elasticURL, &wg, results)
        }(start, end)
    }
    
    // Wait for all batches to complete
    go func() {
        wg.Wait()
        close(results)
    }()
    
    // Check for errors
    for err := range results {
        if err != nil {
            log.Fatal("Batch processing failed:", err)
        }
    }
    
    totalTime := time.Since(startTime)
    fmt.Printf("All batches completed successfully in %.2f minutes!\n", totalTime.Minutes())
    fmt.Printf("Average processing rate: %.2f batches/minute\n", float64(totalBatches)/totalTime.Minutes())
}
