import anthropic
import os
import json
import pandas as pd

client = anthropic.Anthropic(
    api_key=os.environ.get("ANTHROPIC_API_KEY")
)

agent_rules = """
You are a data analysis assistant.
You only analyze CSV and JSON files.

Explain clearly and concisely.
"""

def analyze_file_with_ai(file_path: str, user_message: str) -> str:
    if file_path.endswith(".csv"):
        df = pd.read_csv(file_path)

        preview = df.head(20).to_string()
        columns = list(df.columns)

        file_content = f"""
CSV File:
Columns: {columns}

Preview (first 20 rows):
{preview}
"""
    elif file_path.endswith("json"):
        with open(file_path, "r") as f:
            data = json.load(f)

        file_content = f"""
JSON File:
{json.dumps(data, indent=2)[:4000]}
"""

    else:
        return "Unsupported file format"

    messages = [
        {
            "role": "user",
            "content": f"""
Here is the file content:
{file_content}

User question:
{user_message}
"""
        }
    ]  

    res = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=1024,
        system=agent_rules,
        messages=messages
    )

    return res.content[0].text