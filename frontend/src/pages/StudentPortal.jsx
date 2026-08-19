import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  const [answers, setAnswers] = useState(Array(9).fill(0));
  const [crisisMode, setCrisisMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false); // New state for success screen

  const handleSelect = (index, value) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
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
        // NO MORE ALERT. Transition to success screen.
        setIsSubmitted(true);
      }
    } catch (error) {
      saveOfflineAssessment(answers);
      // We will keep the offline alert for now since it is critical system feedback, 
      // but transition them to the success screen right after.
      alert("You are currently offline. Your assessment is saved securely on your device and will sync when you reconnect.");
      setIsSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 1. The Crisis Routing Screen
  if (crisisMode) {
    return (
      <div className="p-10 bg-[#fff0f0] text-center rounded-[2rem] border-4 border-red-300 shadow-2xl max-w-2xl mx-auto mt-10">
        <h2 className="text-3xl font-extrabold text-red-700 mb-6">You are not alone. Help is available right now.</h2>
        <p className="text-xl mb-6 text-gray-800">Please reach out immediately to our 24/7 confidential support team.</p>
        <div className="text-4xl font-black text-red-600 mb-8 bg-white py-4 rounded-xl shadow-inner tracking-widest">14416</div>
        <p className="font-bold text-gray-500 mb-6">Toll-Free Tele-MANAS Helpline</p>
        <button onClick={() => setCrisisMode(false)} className="px-8 py-3 bg-gray-300 text-gray-800 font-bold rounded-full hover:bg-gray-400 transition-colors">Close</button>
      </div>
    );
  }

  // 2. The New Success Screen (Replaces the alert popup)
  if (isSubmitted) {
    return (
      <div className="p-10 bg-white text-center rounded-[2rem] border-t-8 border-[#819E8E] shadow-2xl max-w-2xl mx-auto mt-16">
        <div className="w-20 h-20 bg-[#E9D3C8] rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-[#4A5D53]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
        </div>
        <h2 className="text-3xl font-extrabold text-[#4A5D53] mb-4">Assessment Complete</h2>
        <p className="text-lg text-[#819E8E] mb-10">Thank you. Your responses have been securely and confidentially submitted to the system.</p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button 
            onClick={() => { setIsSubmitted(false); setAnswers(Array(9).fill(0)); }} 
            className="px-8 py-4 bg-[#F7F0E6] text-[#4A5D53] border-2 border-[#B7C7BC] font-bold rounded-xl hover:bg-[#E9D3C8] transition-colors"
          >
            Start New Session
          </button>
          <button 
            onClick={handleLogout} 
            className="px-8 py-4 bg-[#819E8E] text-white font-bold rounded-xl hover:bg-[#4A5D53] transition-colors shadow-md"
          >
            Secure Sign Out
          </button>
        </div>
      </div>
    );
  }

  // 3. The Assessment Form
  return (
    <div className="max-w-3xl mx-auto p-6 md:p-10 bg-white shadow-2xl rounded-[2rem] mt-6 border-t-8 border-[#B7C7BC]">
      <div className="mb-8 border-b-2 border-[#E9D3C8] pb-6">
        <h2 className="text-3xl font-extrabold mb-3 text-[#4A5D53]">Wellbeing Check-in</h2>
        <p className="text-[#819E8E] text-lg font-medium">Over the last 2 weeks, how often have you been bothered by any of the following problems?</p>
      </div>
      
      <form onSubmit={handleSubmit}>
        {PHQ9_QUESTIONS.map((q, index) => (
          <div key={index} className="mb-8 p-6 rounded-2xl bg-[#F7F0E6] border border-[#E9D3C8] shadow-sm hover:shadow-md transition-shadow">
            <p className="font-bold mb-5 text-[#4A5D53] text-lg">{index + 1}. {q}</p>
            <div className="flex flex-col sm:flex-row gap-3">
              {['Not at all', 'Several days', 'More than half the days', 'Nearly every day'].map((opt, val) => (
                <label 
                  key={val} 
                  className={`flex-1 flex items-center justify-center p-3 rounded-xl cursor-pointer transition-all duration-200 border-2 ${
                    answers[index] === val 
                      ? 'bg-[#819E8E] text-white border-[#819E8E] font-bold shadow-md scale-[1.02]' 
                      : 'bg-white text-[#4A5D53] border-[#B7C7BC] hover:bg-[#E9D3C8]'
                  }`}
                >
                  <input 
                    type="radio" 
                    name={`q-${index}`} 
                    value={val} 
                    className="hidden"
                    onChange={() => handleSelect(index, val)}
                    checked={answers[index] === val}
                  />
                  <span className="text-sm text-center">{opt}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
        <button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full bg-[#4A5D53] text-[#F7F0E6] py-5 rounded-2xl font-extrabold text-xl hover:bg-[#819E8E] hover:shadow-lg disabled:bg-[#B7C7BC] transition-all"
        >
          {isSubmitting ? 'Submitting securely...' : 'Submit Securely'}
        </button>
      </form>
    </div>
  );
}