"""
Faustus Backend Server
A Flask application that handles chat interactions with Mistral AI

Key features:
- REST API for chat interactions
- Static file serving
- CORS support for local development
- Error handling and logging
- Mistral AI integration
"""

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from mistralai.client import MistralClient
from mistralai.models.chat_completion import ChatMessage
import os
from whitenoise import WhiteNoise

# Initialize Flask app with CORS support
app = Flask(__name__)
CORS(app)
app.wsgi_app = WhiteNoise(app.wsgi_app, root='.')

# Initialize Mistral AI client
client = MistralClient(api_key=os.environ.get("MISTRAL_API_KEY"))

"""
Routes:
- / : Serves the main application
- /<path> : Serves static files
- /api/chat : Handles chat interactions
"""

# Add static file serving
@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory('.', path)

@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        if not request.is_json:
            return jsonify({"error": "Expected JSON data"}), 400
            
        data = request.json
        messages = data.get('messages', [])
        if not messages:
            return jsonify({"error": "No messages provided"}), 400
            
        # Convert messages to ChatMessage objects
        chat_messages = [ChatMessage(role=msg["role"], content=msg["content"]) for msg in messages]
        
        # Get response from Mistral
        response = client.chat(
            model="mistral-small-latest",
            messages=chat_messages
        )
        
        # Access the content from the choices array
        result = {"content": response.choices[0].message.content}
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    # Get port from environment variable or default to 5000
    port = int(os.environ.get("PORT", 5000))
    # Run app with host set to '0.0.0.0' to be visible externally
    app.run(host='0.0.0.0', port=port, debug=False)