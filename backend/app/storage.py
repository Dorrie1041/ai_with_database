import os

from dotenv import load_dotenv
from google.cloud import storage
from datetime import timedelta

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

# uploads a file from your backend to Google Cloud Storage
def upload_file_to_gcs(file_obj, destination_blob_name: str, content_type: str | None = None) -> str:
    blob = bucket.blob(destination_blob_name)
    blob.upload_from_file(file_obj, content_type=content_type)
    return blob.name

# create temporary download link valid for 15 minutes
def generate_signed_download_url(blob_name: str) -> str:
    blob = bucket.blob(blob_name)
    url = blob.generate_signed_url(
        version="v4",
        expiration=timedelta(minutes=15),
        method="GET",
    )
    return url

# create the preview url 
def generate_signed_preview_url(blob_name: str) -> str:
    blob = bucket.blob(blob_name)
    url = blob.generate_signed_url(
        version="v4",
        expiration=timedelta(minutes=15),
        method="GET",
    )
    return url

# delete file from the Google Cloud Storage
def delete_file_from_gcs(blob_name: str) -> None:
    blob = bucket.blob(blob_name)
    blob.delete()

