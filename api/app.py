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

from flask import Flask, request, jsonify, send_from_directory, Response, stream_with_context
from flask_cors import CORS
from mistralai.client import MistralClient
from mistralai.models.chat_completion import ChatMessage
import os
from whitenoise import WhiteNoise

# Initialize Flask app with CORS support
app = Flask(__name__, static_folder='../static', static_url_path='')
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
    return app.send_static_file('index.html')

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
            
        chat_messages = [ChatMessage(role=msg["role"], content=msg["content"]) for msg in messages]

        def generate():
            response = client.chat_stream(
                model="mistral-large-latest",
                messages=chat_messages
            )
            
            for chunk in response:
                if chunk.choices[0].delta.content:
                    yield f"data: {chunk.choices[0].delta.content}\n\n"
            
            yield "data: [DONE]\n\n"

        return Response(
            stream_with_context(generate()),
            mimetype='text/event-stream'
        )
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    # Get port from environment variable or default to 5000
    port = int(os.environ.get("PORT", 5000))
    # Run app with host set to '0.0.0.0' to be visible externally
    app.run(host='0.0.0.0', port=port, debug=False)