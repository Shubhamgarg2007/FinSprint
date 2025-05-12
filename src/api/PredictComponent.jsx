// src/PredictComponent.jsx
import { getPrediction } from './backendApi';

function PredictComponent() {
  const handlePredict = async () => {
    const payload = { stock: 'AAPL' };
    try {
      const result = await getPrediction(payload);
      console.log('Prediction result:', result);
    } catch (err) {
      alert('Failed to get prediction');
    }
  };

  return <button onClick={handlePredict}>Predict</button>;
}

export default PredictComponent;
