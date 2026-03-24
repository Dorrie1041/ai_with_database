import os

from dotenv import load_dotenv
from google.cloud import storage

load_dotenv()

GOOGLE_APPLICATION_CREDENTIALS = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
GCS_BUVKET_NAME = os.getenv("GCS_BUVKET_NAME")

if not GOOGLE_APPLICATION_CREDENTIALS:
    raise ValueError("GOOGLE_APPLICATION_CREDENTIALS not there")

if not GCS_BUVKET_NAME:
    raise ValueError("GCS_BUVKET_NAME not there")

os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = GOOGLE_APPLICATION_CREDENTIALS

storage_client = storage.Client()
bucket = storage_client.bucket(GCS_BUVKET_NAME)

def upload_file_to_gcs(file_obj, destination_blob_name: str, content_type: str | None = None) -> str:
    blob = bucket.blob(destination_blob_name)
    blob.upload_from_file(file_obj, content_type=content_type)
    return blob.name