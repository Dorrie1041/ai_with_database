import anthropic
import os

client = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))
agent_rules = """
	1.	Output only MySQL code.
Do not include explanations, comments, markdown formatting, or additional text.
	2.	Return a single MySQL query or a sequence of queries if required.
	3.	Use standard MySQL syntax compatible with MySQL 8+.
	4.	Do not explain your reasoning.
Your entire response must consist only of executable MySQL.
	5.	If the user’s request is unclear or missing information, output the most reasonable MySQL query based on typical assumptions.
	6.	Never include phrases like:
	•	“Here is the query”
	•	“Explanation”
	•	“SQL:”
"""

conversation_history = []

def chat(user_inputs):
    conversation_history.append({
        "role": "user",
        "content": user_inputs
    })

    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=1024,
        system= agent_rules,
        messages=conversation_history
    )

    assistant_reply = response.content[0].text

    conversation_history.append({
        "role":"assistant",
        "content":assistant_reply
    })

    return assistant_reply

print("Chat started! Type 'quit' or 'q' to exit.\n")

while True:
    user_input = input("You: ")

    if user_input.lower() == "quit" or user_input.lower() == "q" :
        print("Goodbye !")
        break

    reply = chat(user_input)
    print(f"ans: {reply}\n")