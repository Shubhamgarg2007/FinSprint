const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://finsprint-backend.onrender.com';

export const getPrediction = async (payload) => {
  try {
    const response = await fetch(`${BACKEND_URL}/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Prediction API error:', error);
    throw error;
  }
};
