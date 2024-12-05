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
api_key = os.environ.get("MISTRAL_API_KEY")
if not api_key:
    raise ValueError("MISTRAL_API_KEY environment variable is not set")
client = MistralClient(api_key=api_key)

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
            
        print(f"Received messages: {messages}")
        print(f"Using API key: {api_key[:5]}...{api_key[-5:]}")
            
        chat_messages = [ChatMessage(role=msg["role"], content=msg["content"]) for msg in messages]

        def generate():
            try:
                has_content = False
                print("Starting chat stream with Mistral AI...")
                response = client.chat_stream(
                    model="mistral-large",  # Changed from mistral-large-latest
                    messages=chat_messages,
                    max_tokens=2000,
                    temperature=0.7
                )
                
                print("Stream created, waiting for chunks...")
                for chunk in response:
                    print(f"Raw chunk: {chunk}")
                    if chunk and hasattr(chunk, 'choices') and chunk.choices:
                        delta = chunk.choices[0].delta
                        if hasattr(delta, 'content') and delta.content:
                            content = delta.content
                            has_content = True
                            print(f"Sending chunk: {content}")
                            yield f"data: {content}\n\n"
                
                if not has_content:
                    error_msg = "No content received from Mistral AI - please check your API key and model configuration"
                    print(error_msg)
                    yield f"data: Error: {error_msg}\n\n"
                    return

                print("Stream complete")
                yield "data: [DONE]\n\n"
            except Exception as e:
                error_msg = f"Stream error: {str(e)}"
                print(error_msg)
                yield f"data: Error: {error_msg}\n\n"

        return Response(
            stream_with_context(generate()),
            mimetype='text/event-stream',
            headers={
                'Cache-Control': 'no-cache',
                'X-Accel-Buffering': 'no'
            }
        )
    except Exception as e:
        error_msg = f"Chat endpoint error: {str(e)}"
        print(error_msg)
        return jsonify({"error": error_msg}), 500

if __name__ == '__main__':
    # Get port from environment variable or default to 5000
    port = int(os.environ.get("PORT", 5000))
    # Run app with host set to '0.0.0.0' to be visible externally
    app.run(host='0.0.0.0', port=port, debug=False)