#!/bin/bash
# author: Munkh-Orgil Myagmarsuren 
# Create and configure Google Cloud Project for Gmail API

RESET='\033[0m'
PURPLE='\033[0;35m'
GREEN='\033[0;32m'

BOLD='\033[1m'

PROJECT_ID="erxes-gmail-$(echo $RANDOM)"
TOPIC="erxes-gmail-topic-$(echo $RANDOM)"
SUBSCRIPTION="erxes-gmail-subscription"
SERVICE_ACCOUNT="erxes-service-account-$(echo $RANDOM)"
PUBSUB_SERVICE_ACCOUNT="service-${PROJECT_NUMBER}@gcp-sa-pubsub.iam.gserviceaccount.com"
DOMAIN=""

function log {
  echo -e "${GREEN}${1}${RESET}"
}

(
  set -e

  echo "
  /*      _\|/_
          (o o)
  +----oOO-{_}-OOo----------------------------------+
  |                                                 |
  |                                                 |
  |            Thanks for using Erxes               |
  |           Let's setup Gmail for you             |
  |     Please install Google Cloud Platform SDK    |
  |  https://cloud.google.com/sdk/docs/quickstarts  |
  |                                                 |
  +-------------------------------------------------*/
  "

  read -p "Please enter your domain: " DOMAIN

  if [ -z "$DOMAIN" ]
  then
    exit 'echo DOMAIN did not supplied'
  fi

  # Initialize 
  gcloud init --skip-diagnostics 

  # Login to account
  gcloud auth login --quiet

  log "Creating GCP Project ${PROJECT_ID}"

  # Create Google Cloud Project
  gcloud projects create ${PROJECT_ID} --name='erxes-gmail-project'

  # Set project as default core/project
  gcloud config set project ${PROJECT_ID}

  log "Enabling Pub/Sub API"

  # Enable Pub/Sub API
  gcloud services enable pubsub.googleapis.com

  log "Enabling Gmail API"

  # Enable Gmail API
  gcloud services enable gmail.googleapis.com

  log "Creating Gmail Topic ${TOPIC}"
  log "This may take a while...😬"

  # If the topic's project was recently created, you may need to wait a few
  # minutes for the project's organization policy to be properly initialized,
  # and then retry this operation.
  sleep 60

  # Create Gmail Topic
  gcloud pubsub topics create ${TOPIC}

  log "Creating Gmail subscription ${SUBSCRIPTION}"

  # configure the subscription push identity
  gcloud pubsub subscriptions create ${SUBSCRIPTION} \
   --topic=${TOPIC} \
   --topic-project=${PROJECT_ID} \
   --push-endpoint="https://${DOMAIN}/integrations/gmail/webhook"
  # --push-auth-service-account=${SERVICE_ACCOUNT_EMAIL} \

  log "Adding publish role to gmail-api-push service account"

  # Add gmail api service account pub/sub - publish role
  gcloud pubsub topics add-iam-policy-binding ${TOPIC} \
   --member="serviceAccount:gmail-api-push@system.gserviceaccount.com" \
   --role="roles/pubsub.publisher"

  echo -e "
  
  \033[33;7m${BOLD}ONE LAST STEP${RESET}
  +==================================================================================================================+

     ${PURPLE}${BOLD}[ Create app in OAuth Consent screen ]${RESET}                                                 
     1. Navigate to https://console.cloud.google.com/apis/credentials/consent?project=${PROJECT_ID}                  
     2. Fill the form and create/edit app                                                                           
     3. Click on the [Add Scope] button                                                                             
     4. Search [Gmail API] and select https://mail.google.com/ scope and [Add]                                      
                                                                                                                    
     ${PURPLE}${BOLD}[ Create OAuth Client ]${RESET}                                                                
     1. Navigate to https://console.cloud.google.com/apis/credentials?project=${PROJECT_ID}                         
     2. Click on the +Credentials and select OAuth Client ID                                                        
     3. Select [Web Application] type and write App name                                                            
     4. Authorized redirect URIs add as https://${DOMAIN}/integrations/gmail/login              
     5. Click Create button and you will get your [Client ID] and [Client Secret] copy them          
  
  
     ${PURPLE}${BOLD}[ Navigate to Erxes [System config] and fill them as follows ]${RESET}
     PROJECT_ID: ${GREEN}${PROJECT_ID}${RESET}                                   
     TOPIC: ${GREEN}${TOPIC}${RESET}                                             
    ┏━ GOOGLE_CLIENT_ID: // CLIENT_ID in OAuth Client            
    ┣━ GOOGLE_CLIENT_SECRET: // CLIENT_SECRET in OAuth Client      
    ┃                                                               
    ┗━ ${GREEN}Navigate to https://console.cloud.google.com/apis/credentials?project=${PROJECT_ID} and select [Web Client]${RESET}
  
  +==================================================================================================================+

  References
  ==========
  Configure your Push Endpoint https://console.cloud.google.com/cloudpubsub/subscription/detail/erxes-gmail-subscription?project=${PROJECT_ID}
  "

  log "Gmail setup succesfully done 🛸🛸🛸"
  log "ＥＲＸＥＳ Rocks!"
)

errorCode=$?

if [ $errorCode -ne 0 ]; then
  log "Error occurred while setting up GCP - Gmail"
  exit $errorCode
fi
