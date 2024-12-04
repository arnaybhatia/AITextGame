
from flask import Flask, request, jsonify
from flask_cors import CORS
from mistralai.client import MistralClient
from mistralai.models.chat_completion import ChatMessage
import os

app = Flask(__name__)
CORS(app)

client = MistralClient(api_key=os.environ.get("MISTRAL_API_KEY"))

@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.json
        messages = data.get('messages', [])
        
        # Convert messages to ChatMessage objects
        chat_messages = [ChatMessage(role=msg["role"], content=msg["content"]) for msg in messages]
        
        # Get response from Mistral
        response = client.chat(
            model="mistral-small-latest",
            messages=chat_messages
        )
        
        return jsonify({
            "content": response.messages[-1].content
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)