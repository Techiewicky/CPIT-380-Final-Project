import logging
import json
import tensorflow as tf
import numpy as np
import os
import io
from flask import Flask, request, jsonify, render_template
from PIL import Image
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
# Suppress TensorFlow logging if desired
logging.getLogger('tensorflow').setLevel(logging.ERROR)

# Get the base directory (the directory where this script is located)
base_dir = os.path.dirname(os.path.abspath(__file__))

# Define paths to the model components relative to the base directory
model_components = {
    'cancer': {
        'keras_model': os.path.join(base_dir, 'Models', 'cancer.keras'),
        'labels': ['Glioma', 'Meningioma', 'No tumor', 'Pituitary']
    },
    'alzheimer': {
        'config': os.path.join(base_dir, 'Models', 'alzheimer.keras', 'config.json'),
        'weights': os.path.join(base_dir, 'Models', 'alzheimer.keras', 'model.weights.h5'),
        'labels': ['Mild Demented', 'Moderate Demented', 'Not Demented', 'Very Mild Demented']
    },
    'ms': {
        'config': os.path.join(base_dir, 'Models', 'ms.keras', 'config.json'),
        'weights': os.path.join(base_dir, 'Models', 'ms.keras', 'model.weights.h5'),
        'labels': ['Negative1', 'Negative2', 'Positive1', 'Positive2']
    }
}

# Load models
models = {}
for disease, components in model_components.items():
    try:
        if 'keras_model' in components:
            # Load model directly from the .keras file
            model = tf.keras.models.load_model(components['keras_model'])
        else:
            # Load model architecture
            with open(components['config'], 'r') as config_file:
                model_json = config_file.read()
            model = tf.keras.models.model_from_json(model_json)
            
            # Load weights
            model.load_weights(components['weights'])
        
        # Compile model (if needed)
        model.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])
        
        models[disease] = model
        print(f"Loaded model for {disease}")
    except Exception as e:
        print(f"Error loading model for {disease}: {e}")

def load_and_preprocess_image(photo_file, disease):
    try:
        img_bytes = io.BytesIO(photo_file.read())
        with Image.open(img_bytes) as img:
            if img.mode != 'RGB':
                img = img.convert('RGB')
            # Resize the image to the expected input size for your model
            img = img.resize((176, 176))
            img_array = np.array(img)
        img_array = np.expand_dims(img_array, axis=0)  # Add batch dimension
        img_array = img_array / 255.0  # Normalize pixel values to [0, 1]
        return img_array
    except Exception as e:
        raise ValueError(f"Error processing image: {e}")

def get_prediction(model, img_array, labels):
    predictions = model.predict(img_array)
    predicted_probabilities = predictions[0]
    print(predicted_probabilities)

    if 'Negative1' in labels and 'Negative2' in labels:
        negative_sum = predicted_probabilities[labels.index('Negative1')] + predicted_probabilities[labels.index('Negative2')]
        positive_sum = predicted_probabilities[labels.index('Positive1')] + predicted_probabilities[labels.index('Positive2')]

        if negative_sum > positive_sum:
            predicted_class_label = 'Negative'
            confidence_percentage = negative_sum * 100
        else:
            predicted_class_label = 'Positive'
            confidence_percentage = positive_sum * 100
    else:
        predicted_class_index = np.argmax(predicted_probabilities)
        print(predicted_class_index)
        predicted_class_label = labels[predicted_class_index]
        print(predicted_class_label)
        confidence_percentage = predicted_probabilities[predicted_class_index] * 100

    return predicted_class_label, confidence_percentage

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/predict/<disease>', methods=['POST'])
def predict(disease):
    if disease not in models:
        return jsonify({'error': f'Invalid disease type: {disease}'}), 400
    
    if 'file' not in request.files:
        return jsonify({'error': 'No file part in the request'}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({'error': 'No file selected for uploading'}), 400
    
    try:
        img_array = load_and_preprocess_image(file, disease)
        model = models[disease]
        labels = model_components[disease]['labels']
        predicted_class_label, confidence_percentage = get_prediction(model, img_array, labels)
        response = {
            'disease': disease,
            'predicted_class': predicted_class_label,
            'confidence': round(confidence_percentage, 2)
        }
        return jsonify(response), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')
