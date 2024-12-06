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
            
        # Convert messages to ChatMessage format
        chat_messages = [ChatMessage(role=msg["role"], content=msg["content"]) for msg in messages]

        def generate():
            try:
                response = client.chat_stream(
                    model="mistral-medium",  # Using medium model for better reliability
                    messages=chat_messages,
                    temperature=0.7,
                    max_tokens=4096,
                    top_p=0.95,
                    safe_mode=False
                )

                has_yielded = False
                for chunk in response:
                    if hasattr(chunk.choices[0].delta, 'content') and chunk.choices[0].delta.content:
                        content = chunk.choices[0].delta.content
                        has_yielded = True
                        yield f"data: {content}\n\n"

                if not has_yielded:
                    yield f"data: Error: No response generated\n\n"
                else:
                    yield "data: [DONE]\n\n"

            except Exception as e:
                print(f"Stream error: {str(e)}")
                yield f"data: Error: {str(e)}\n\n"

        return Response(
            stream_with_context(generate()),
            mimetype='text/event-stream',
            headers={
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
                'X-Accel-Buffering': 'no'
            }
        )
    except Exception as e:
        print(f"Chat endpoint error: {str(e)}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    # Get port from environment variable or default to 5000
    port = int(os.environ.get("PORT", 5000))
    # Run app with host set to '0.0.0.0' to be visible externally
    app.run(host='0.0.0.0', port=port, debug=False)