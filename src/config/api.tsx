export const API_URL = import.meta.env.VITE_API_URL;

export const API_ENDPOINTS = {
  questions: () => `${API_URL}/api/questions`, 
  questionById: (questionId: string) => `${API_URL}/api/questions/${questionId}`, 

  challenges: () => `${API_URL}/api/challenges`,
  challengeById: (challengeId: string) => `${API_URL}/api/challenges/${challengeId}`,

  challengeQuestions: (challengeId: string) => `${API_URL}/api/challenge-questions/${challengeId}`,
  assignQuestionToChallenge: () => `${API_URL}/api/challenge-questions`,

  userResponses: () => `${API_URL}/api/user-responses`,
};