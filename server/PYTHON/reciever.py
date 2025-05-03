import sys
import json

if len(sys.argv) > 1:
    try:
        data = json.loads(sys.argv[1])
        print(f"Hello {data['name']}, you are {data['age']} years old!")
    except json.JSONDecodeError:
        print("Failed to decode JSON data.")
else:
    print("No data received.")
