#!/usr/bin/python

import os
import subprocess
from dotenv import load_dotenv
from elasticsearch import Elasticsearch
import pymongo

load_dotenv()

MONGO_URL = os.getenv('MONGO_URL')
ELASTICSEARCH_URL = os.getenv('ELASTICSEARCH_URL')

client = Elasticsearch([ELASTICSEARCH_URL])

customer_mapping = {
    'primaryEmail': {
        'type': 'text',
        'analyzer': 'uax_url_email_analyzer',
    },
    'integrationId': {
        'type': 'keyword',
    },
    'relatedIntegrationIds': {
        'type': 'keyword',
    },
    'scopeBrandIds': {
        'type': 'keyword',
    },
    'ownerId': {
        'type': 'keyword',
    },
    'position': {
        'type': 'keyword',
    },
    'leadStatus': {
        'type': 'keyword',
    },
    'tagIds': {
        'type': 'keyword',
    },
    'companyIds': {
        'type': 'keyword',
    },
    'mergedIds': {
        'type': 'keyword',
    },
    'status': {
        'type': 'keyword',
    },
    'emailValidationStatus': {
        'type': 'keyword',
    },
}

company_mapping = {
    'primaryEmail': {
        'type': 'text',
        'analyzer': 'uax_url_email_analyzer',
    },
    'scopeBrandIds': {
        'type': 'keyword',
    },
    'plan': {
        'type': 'keyword',
    },
    'industry': {
        'type': 'keyword',
    },
    'parentCompanyId': {
        'type': 'keyword',
    },
    'ownerId': {
        'type': 'keyword',
    },
    'tagIds': {
        'type': 'keyword',
    },
    'mergedIds': {
        'type': 'keyword',
    },
    'status': {
        'type': 'keyword',
    },
    'businessType': {
        'type': 'keyword',
    },
}

event_mapping = {
    'type': {
        'type': 'keyword',
    },
    'name': {
        'type': 'keyword',
    },
    'customerId': {
        'type': 'keyword',
    },
}

analysis = {
    'analyzer': {
        'uax_url_email_analyzer': {
            'tokenizer': 'uax_url_email_tokenizer',
        },
    },
    'tokenizer': {
        'uax_url_email_tokenizer': {
            'type': 'uax_url_email',
        },
    },
}

def put_mappings(index, mapping):
    """
    Create mappings
    """

    response = client.indices.exists(index=index)

    print('Create index for %s' % index, response)

    if not response:
        response = client.indices.create(index=index, body={'settings': {'analysis': analysis}})

        print('Response', response)

    try:
        response = client.indices.put_mapping(index=index, body = {'properties': mapping})

        print(response)
    except Exception as e:
        print(e)


db_name = pymongo.uri_parser.parse_uri(MONGO_URL)['database']

put_mappings('%s__customers' % db_name, customer_mapping)
put_mappings('%s__companies' % db_name, company_mapping)
put_mappings('%s__events' % db_name, event_mapping)

command = 'mongo-connector -m "%s"  -c mongo-connector-config.json --target-url %s' % (MONGO_URL, ELASTICSEARCH_URL)

print('Starting connector ....', command)

process = subprocess.Popen(command, shell=True)

process.wait()

print('End connector')