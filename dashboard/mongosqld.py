import os

from dotenv import load_dotenv

load_dotenv()

MONGO_URL = os.getenv('MONGO_URL')

os.system(f"mongosqld --mongo-uri {MONGO_URL} --addr 0.0.0.0:3307")

