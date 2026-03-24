from storage import bucket

def test_connection():
    print("Bucket name:", bucket.name)

if __name__ == "__main__":
    test_connection()