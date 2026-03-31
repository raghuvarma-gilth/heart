"""
CardioMind - Flask Backend API  
Heart Disease Prediction + Grok AI Integration
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
import pandas as pd
import os
import json
import requests

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

MODEL_DIR = os.path.join(os.path.dirname(__file__), 'model')
GROQ_API_KEY = os.environ.get('GROQ_API_KEY', '')
GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'

model = None
scaler = None
metadata = None

def load_model():
    global model, scaler, metadata
    try:
        mp = os.path.join(MODEL_DIR, 'model.pkl')
        sp = os.path.join(MODEL_DIR, 'scaler.pkl')
        mdp = os.path.join(MODEL_DIR, 'metadata.json')
        if os.path.exists(mp):
            model = joblib.load(mp)
            print("✅ Model loaded")
        if os.path.exists(sp):
            scaler = joblib.load(sp)
            print("✅ Scaler loaded")
        if os.path.exists(mdp):
            with open(mdp) as f:
                metadata = json.load(f)
            print("✅ Metadata loaded")
    except Exception as e:
        print(f"❌ Error: {e}")

load_model()

def engineer_features_from_input(data):
    """Recreate the same engineered features used in training"""
    age = float(data.get('age', 50))
    sex = float(data.get('sex', 0))
    cp = float(data.get('cp', 0))
    trestbps = float(data.get('trestbps', 120))
    chol = float(data.get('chol', 200))
    fbs = float(data.get('fbs', 0))
    restecg = float(data.get('restecg', 0))
    thalach = float(data.get('thalach', 150))
    exang = float(data.get('exang', 0))
    oldpeak = float(data.get('oldpeak', 0))
    slope = float(data.get('slope', 0))
    ca = float(data.get('ca', 0))
    thal = float(data.get('thal', 0))

    # Age group
    if age <= 40: age_group = 0
    elif age <= 55: age_group = 1
    elif age <= 70: age_group = 2
    else: age_group = 3

    # BP category
    if trestbps <= 120: bp_category = 0
    elif trestbps <= 140: bp_category = 1
    elif trestbps <= 160: bp_category = 2
    else: bp_category = 3

    # Cholesterol category
    if chol <= 200: chol_category = 0
    elif chol <= 240: chol_category = 1
    elif chol <= 300: chol_category = 2
    else: chol_category = 3

    hr_reserve = (220 - age) - thalach
    risk_score = (
        int(age > 55) + int(trestbps > 140) + int(chol > 240) +
        int(fbs) + int(exang) + int(oldpeak > 2) + int(ca > 0)
    )
    age_chol = age * chol / 1000
    age_bp = age * trestbps / 1000
    hr_bp_ratio = thalach / (trestbps + 1)

    features = [age, sex, cp, trestbps, chol, fbs, restecg, thalach, exang,
                oldpeak, slope, ca, thal, age_group, bp_category, chol_category,
                hr_reserve, risk_score, age_chol, age_bp, hr_bp_ratio]
    return np.array([features])

def call_grok(prompt, system_message="You are CardioMind AI, a helpful healthcare assistant. Provide clear, professional medical information. Always recommend consulting a real doctor for serious concerns.", max_tokens=1000):
    if not GROQ_API_KEY:
        return {"error": "Groq API key not configured", "fallback": True}
    try:
        headers = {
            'Authorization': f'Bearer {GROQ_API_KEY}',
            'Content-Type': 'application/json'
        }
        payload = {
            'model': 'llama-3.3-70b-versatile',
            'messages': [
                {'role': 'system', 'content': system_message},
                {'role': 'user', 'content': prompt}
            ],
            'max_tokens': max_tokens,
            'temperature': 0.7
        }
        response = requests.post(GROQ_API_URL, headers=headers, json=payload, timeout=30)
        response.raise_for_status()
        data = response.json()
        return {'response': data['choices'][0]['message']['content'], 'success': True}
    except requests.exceptions.Timeout:
        return {'error': 'API timeout', 'fallback': True}
    except Exception as e:
        return {'error': str(e), 'fallback': True}

@app.route('/', methods=['GET'])
def health_check():
    return jsonify({
        'service': 'CardioMind API',
        'status': 'running',
        'model_loaded': model is not None,
        'version': '1.0.0'
    })

@app.route('/predict', methods=['POST'])
def predict():
    try:
        if model is None or scaler is None:
            return jsonify({'error': 'Model not loaded. Run train.py first.'}), 503
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No input data provided'}), 400

        original_features = ['age','sex','cp','trestbps','chol','fbs','restecg','thalach','exang','oldpeak','slope','ca','thal']
        missing = [f for f in original_features if f not in data]
        if missing:
            return jsonify({'error': f'Missing features: {missing}'}), 400

        features = engineer_features_from_input(data)
        features_scaled = scaler.transform(features)

        prediction_num = int(model.predict(features_scaled)[0])
        probability = float(model.predict_proba(features_scaled)[0][1])

        if probability < 0.3:
            risk_level = 'Low'
        elif probability < 0.6:
            risk_level = 'Medium'
        else:
            risk_level = 'High'

        prediction_text = "Heart Disease Detected" if prediction_num == 1 else "No Heart Disease"
        
        # Generate recommendation based on risk
        if risk_level == 'High':
            recommendation = "⚠️ High risk detected. Please consult a cardiologist immediately. Monitor blood pressure, maintain a heart-healthy diet, and avoid strenuous activity until medical evaluation."
        elif risk_level == 'Medium':
            recommendation = "⚡ Moderate risk detected. Schedule a check-up with your doctor. Focus on regular exercise, reducing salt intake, and managing stress levels."
        else:
            recommendation = "✅ Low risk detected. Maintain your healthy lifestyle! Continue regular exercise, balanced diet, and routine health check-ups."

        return jsonify({
            'prediction': prediction_text,
            'prediction_num': prediction_num,
            'probability': round(probability * 100, 2),
            'risk_level': risk_level,
            'message': prediction_text,
            'recommendation': recommendation,
            'model_accuracy': metadata.get('accuracy', 0) if metadata else 0
        })
    except ValueError as e:
        return jsonify({'error': f'Invalid input values: {str(e)}'}), 400
    except Exception as e:
        return jsonify({'error': f'Prediction error: {str(e)}'}), 500

@app.route('/api/grok/explain', methods=['POST'])
def grok_explain():
    try:
        data = request.get_json()
        pd_data = data.get('predictionData', {})
        pt_data = data.get('patientData', {})
        prompt = f"""A patient received a heart disease risk assessment:
- Risk Level: {pd_data.get('risk_level', 'Unknown')}
- Probability: {pd_data.get('probability', 0)}%
- Prediction: {'Heart disease detected' if pd_data.get('prediction') == 1 else 'No heart disease detected'}

Patient: Age {pt_data.get('age','N/A')}, {'Male' if pt_data.get('sex')==1 else 'Female'}, BP {pt_data.get('trestbps','N/A')} mmHg, Cholesterol {pt_data.get('chol','N/A')} mg/dl, Max HR {pt_data.get('thalach','N/A')}

Provide: 1) Clear explanation 2) Key risk factors 3) Lifestyle changes 4) When to seek medical attention 5) Positive actions today. Be supportive and professional."""
        return jsonify(call_grok(prompt))
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/grok/symptoms', methods=['POST'])
def grok_symptoms():
    try:
        data = request.get_json()
        symptoms = data.get('symptoms', [])
        info = data.get('additionalInfo', '')
        symptoms_str = ', '.join(symptoms) if isinstance(symptoms, list) else symptoms
        prompt = f"""Patient symptoms: {symptoms_str}
Additional info: {info}

Analyze and provide: 1) Risk Assessment (Low/Medium/High) 2) Possible cardiac conditions 3) Immediate actions 4) Warning signs for emergency 5) Lifestyle suggestions 6) When to see doctor. Note: This is AI analysis, not medical diagnosis."""
        return jsonify(call_grok(prompt))
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/grok/stress', methods=['POST'])
def grok_stress():
    try:
        data = request.get_json()
        prompt = f"""Create a personalized stress relief plan for someone with {data.get('stressLevel','moderate')} stress.
Preferences: {data.get('preferences','')}. Time: {data.get('duration','15 minutes')}.

Provide: 1) Breathing exercise with steps 2) Quick 2-min meditation script 3) Gentle exercise 4) Mindfulness tip 5) Heart-stress connection 6) Weekly wellness plan. Be warm and actionable."""
        return jsonify(call_grok(prompt))
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/grok/chat', methods=['POST'])
def grok_chat():
    try:
        data = request.get_json()
        message = data.get('message', '')
        history = data.get('history', [])
        if not GROQ_API_KEY:
            return jsonify({'error': 'Groq API key not configured', 'fallback': True})
        
        system_msg = "You are CardioMind AI Assistant, specializing in heart health and wellness. Be warm, professional, and always recommend consulting real healthcare professionals."
        messages = [{'role': 'system', 'content': system_msg}]
        for msg in history[-10:]:
            messages.append({'role': msg.get('role', 'user'), 'content': msg.get('content', '')})
        messages.append({'role': 'user', 'content': message})

        headers = {'Authorization': f'Bearer {GROQ_API_KEY}', 'Content-Type': 'application/json'}
        payload = {'model': 'llama-3.3-70b-versatile', 'messages': messages, 'max_tokens': 800, 'temperature': 0.7}
        response = requests.post(GROQ_API_URL, headers=headers, json=payload, timeout=30)
        response.raise_for_status()
        result = response.json()
        return jsonify({'response': result['choices'][0]['message']['content'], 'success': True})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/grok/emotion', methods=['POST'])
def grok_emotion():
    try:
        data = request.get_json()
        prompt = f"""Detected emotion: {data.get('emotion','neutral')} ({data.get('confidence',0)}% confidence).

Provide: 1) Emotional insight 2) Heart health impact 3) Recommended actions 4) Quick 1-min wellness exercise 5) Encouraging message. Be concise and warm."""
        return jsonify(call_grok(prompt))
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/model/info', methods=['GET'])
def model_info():
    if metadata:
        return jsonify({
            'accuracy': metadata.get('accuracy', 0),
            'model_type': metadata.get('model_type', 'Unknown'),
            'features': metadata.get('original_feature_names', []),
            'feature_descriptions': metadata.get('feature_descriptions', {}),
            'model_loaded': model is not None
        })
    return jsonify({'error': 'Model metadata not available'}), 404

@app.errorhandler(404)
def not_found(e):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def server_error(e):
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=os.environ.get('FLASK_DEBUG', 'false').lower() == 'true')
