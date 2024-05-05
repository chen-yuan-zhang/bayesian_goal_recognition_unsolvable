#export GOOGLE_APPLICATION_CREDENTIALS="~/path/to/gae-json-token"

# Imports the Google Cloud client library
from google.cloud import datastore

# json library
import json
import os
# Instantiates a client

os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = "xxx.json"

datastore_client = datastore.Client()

# make query
query = datastore_client.query(kind='DataObject')
results = list(query.fetch())
print(json.dumps(results, indent=4, sort_keys=True, default=str))

# system call: pass it to a text file
# python downloadall.py > mydata.txt
