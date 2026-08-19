import React, { useState } from 'react';
import apiClient from '../services/api';
import { saveOfflineAssessment } from '../utils/offlineSync';

const PHQ9_QUESTIONS = [
  "Little interest or pleasure in doing things",
  "Feeling down, depressed, or hopeless",
  "Trouble falling or staying asleep, or sleeping too much",
  "Feeling tired or having little energy",
  "Poor appetite or overeating",
  "Feeling bad about yourself — or that you are a failure",
  "Trouble concentrating on things",
  "Moving or speaking slowly, or being fidgety/restless",
  "Thoughts that you would be better off dead, or of hurting yourself"
];

export default function StudentPortal() {
  const [answers, setAnswers] = useState(Array(9).fill(0));
  const [crisisMode, setCrisisMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSelect = (index, value) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!navigator.onLine) throw new Error("Offline");

      const response = await apiClient.post('/assessments', { answers });
      
      if (response.data.crisisFlag) {
        setCrisisMode(true);
      } else {
        alert("Thank you. Your responses have been confidentially submitted.");
        setAnswers(Array(9).fill(0)); // Reset
      }
    } catch (error) {
      // Fallback for low-bandwidth / offline field conditions
      saveOfflineAssessment(answers);
      alert("You are currently offline. Your assessment is saved securely on your device and will sync when you reconnect.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (crisisMode) {
    return (
      <div className="p-8 bg-red-50 text-center rounded-md border border-red-200 shadow-lg">
        <h2 className="text-2xl font-bold text-red-700 mb-4">You are not alone. Help is available right now.</h2>
        <p className="text-lg mb-4">Please reach out immediately to our 24/7 confidential support team.</p>
        <div className="text-3xl font-bold text-red-600 mb-6">Call Tele-MANAS: 14416</div>
        <button onClick={() => setCrisisMode(false)} className="px-4 py-2 bg-gray-200 rounded">Close</button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-md rounded-lg mt-10">
      <h2 className="text-2xl font-bold mb-2">Wellbeing Check-in</h2>
      <p className="text-gray-600 mb-6">Over the last 2 weeks, how often have you been bothered by any of the following problems?</p>
      
      <form onSubmit={handleSubmit}>
        {PHQ9_QUESTIONS.map((q, index) => (
          <div key={index} className="mb-6 p-4 border rounded bg-gray-50">
            <p className="font-semibold mb-3">{index + 1}. {q}</p>
            <div className="flex gap-4">
              {['Not at all (0)', 'Several days (1)', 'More than half the days (2)', 'Nearly every day (3)'].map((opt, val) => (
                <label key={val} className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="radio" 
                    name={`q-${index}`} 
                    value={val} 
                    checked={answers[index] === val}
                    onChange={() => handleSelect(index, val)}
                    required
                  />
                  <span className="text-sm">{opt}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
        <button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white py-3 rounded font-bold hover:bg-blue-700 disabled:bg-gray-400"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Securely'}
        </button>
      </form>
    </div>
  );
}