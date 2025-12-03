
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Feedback } from '../types';

interface FeedbackContextType {
  feedbacks: Feedback[];
  addFeedback: (feedback: Feedback) => void;
}

const FeedbackContext = createContext<FeedbackContextType | undefined>(undefined);

// Mock Data
const INITIAL_FEEDBACKS: Feedback[] = [
  {
    id: '1',
    orderId: '#ORD-7027',
    userId: '1',
    userName: 'Vikram Singh',
    type: 'cancellation',
    reason: 'Changed my mind',
    comment: 'Found a different color elsewhere.',
    date: '2024-03-09'
  },
  {
    id: '2',
    orderId: '#ORD-7023',
    userId: '1',
    userName: 'Ananya Sharma',
    type: 'review',
    rating: 5,
    comment: 'Absolutely loved the Banarasi saree! The fabric is authentic.',
    date: '2024-03-12'
  }
];

export const FeedbackProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initialize from localStorage
  const [feedbacks, setFeedbacks] = useState<Feedback[]>(() => {
    const saved = localStorage.getItem('vastra_feedbacks');
    return saved ? JSON.parse(saved) : INITIAL_FEEDBACKS;
  });

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem('vastra_feedbacks', JSON.stringify(feedbacks));
  }, [feedbacks]);

  const addFeedback = (feedback: Feedback) => {
    setFeedbacks(prev => [feedback, ...prev]);
  };

  return (
    <FeedbackContext.Provider value={{ feedbacks, addFeedback }}>
      {children}
    </FeedbackContext.Provider>
  );
};

export const useFeedback = () => {
  const context = useContext(FeedbackContext);
  if (!context) {
    throw new Error('useFeedback must be used within a FeedbackProvider');
  }
  return context;
};
