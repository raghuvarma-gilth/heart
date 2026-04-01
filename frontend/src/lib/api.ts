const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://heart-1-yf8q.onrender.com';
const GROQ_API_KEY = process.env.NEXT_PUBLIC_GROQ_API_KEY || '';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// Direct Groq API call from frontend
async function callGroq(
  prompt: string,
  systemMessage = 'You are CardioMind AI, a helpful healthcare assistant specializing in heart health. Provide clear, professional medical information. Always recommend consulting a real doctor for serious concerns.',
  maxTokens = 1000
): Promise<{ response?: string; error?: string; success?: boolean }> {
  if (!GROQ_API_KEY) {
    return { error: 'Groq API key not configured. Add NEXT_PUBLIC_GROQ_API_KEY to .env.local', success: false };
  }
  try {
    const res = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: prompt },
        ],
        max_tokens: maxTokens,
        temperature: 0.7,
      }),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      return { error: errData?.error?.message || `Groq API error: ${res.status}`, success: false };
    }
    const data = await res.json();
    return { response: data.choices?.[0]?.message?.content || 'No response', success: true };
  } catch (err: any) {
    return { error: err.message || 'Failed to connect to Groq API', success: false };
  }
}

// Direct Groq chat with history
async function callGroqChat(
  message: string,
  history: Array<{ role: string; content: string }>,
  maxTokens = 800
): Promise<{ response?: string; error?: string; success?: boolean }> {
  if (!GROQ_API_KEY) {
    return { error: 'Groq API key not configured', success: false };
  }
  try {
    const systemMsg = 'You are CardioMind AI Assistant, specializing in heart health and wellness. Be warm, professional, and always recommend consulting real healthcare professionals for serious concerns.';
    const messages = [
      { role: 'system', content: systemMsg },
      ...history.slice(-10).map(m => ({ role: m.role, content: m.content })),
      { role: 'user', content: message },
    ];
    const res = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages,
        max_tokens: maxTokens,
        temperature: 0.7,
      }),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      return { error: errData?.error?.message || `API error: ${res.status}`, success: false };
    }
    const data = await res.json();
    return { response: data.choices?.[0]?.message?.content || 'No response', success: true };
  } catch (err: any) {
    return { error: err.message || 'Connection failed', success: false };
  }
}

export const api = {
  // Heart prediction still goes through the backend (ML model)
  async predict(data: Record<string, number>) {
    const res = await fetch(`${API_URL}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // AI explanation - direct Groq call from frontend
  async grokExplain(predictionData: any, patientData: any) {
    const prompt = `A patient received a heart disease risk assessment:
- Risk Level: ${predictionData?.risk_level || 'Unknown'}
- Probability: ${predictionData?.probability || 0}%
- Prediction: ${predictionData?.prediction || 'Unknown'}

Patient: Age ${patientData?.age || 'N/A'}, ${patientData?.sex == 1 ? 'Male' : 'Female'}, BP ${patientData?.trestbps || 'N/A'} mmHg, Cholesterol ${patientData?.chol || 'N/A'} mg/dl, Max HR ${patientData?.thalach || 'N/A'}

Provide: 1) Clear explanation of the results 2) Key risk factors identified 3) Recommended lifestyle changes 4) When to seek immediate medical attention 5) Positive actions they can take today. Be supportive and professional.`;
    return callGroq(prompt);
  },

  // Symptom analysis - direct Groq call from frontend
  async grokSymptoms(symptoms: string[], additionalInfo: string) {
    const symptomsStr = symptoms.join(', ');
    const prompt = `Patient symptoms: ${symptomsStr}
Additional info: ${additionalInfo || 'None provided'}

Analyze and provide: 1) Risk Assessment (Low/Medium/High) 2) Possible cardiac-related conditions 3) Immediate actions to take 4) Warning signs that require emergency care 5) Lifestyle suggestions 6) When to see a doctor. Note: This is AI analysis, not a medical diagnosis. Always recommend professional consultation.`;
    return callGroq(prompt);
  },

  // Stress relief plan - direct Groq call from frontend
  async grokStress(stressLevel: string, preferences: string, duration: string) {
    const prompt = `Create a personalized stress relief plan for someone with ${stressLevel} stress.
Preferences: ${preferences}. Available time: ${duration}.

Provide: 1) Breathing exercise with detailed steps 2) Quick 2-minute meditation script 3) Gentle exercise routine 4) Mindfulness tip 5) How stress affects heart health 6) Weekly wellness plan. Be warm, encouraging, and actionable.`;
    return callGroq(prompt);
  },

  // Chat - direct Groq call with history from frontend
  async grokChat(message: string, history: any[]) {
    return callGroqChat(message, history);
  },


  // Model info from backend
  async getModelInfo() {
    const res = await fetch(`${API_URL}/api/model/info`);
    return res.json();
  },
};

