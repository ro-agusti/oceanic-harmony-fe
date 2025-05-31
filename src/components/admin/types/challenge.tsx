// types/challenge.ts

export type Challenge = {
    id: string;
    title: string;
    description?: string;
    days: number;
    createdAt?: string;
    updatedAt?: string;
  };
  
  export type Question = {
    id: string;
    text: string;
    description?: string;
    responseType: "multiple-choice" | "text" | "multiple-text";
    allowCustomText: boolean;
  };
  
  export type ChallengeQuestion = {
    id: string;
    challengeId: string;
    questionId: string;
    week?: number;
    day?: number;
    questionCategory: "daily" | "daily-reflection" | "weekly-reflection" | "challenge-reflection";
    question?: Question; // útil cuando hacés un include de Question en la API
  };
  