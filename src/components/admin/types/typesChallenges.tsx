export interface SelectedQuestion {
  question: {
    id: string;
    text: string;
    description?: string;
  };
  day: number;
  week: number;
  questionCategory: string;
}

export interface ChallengeData {
  days: number;
  weeks: number;
  dailyCount: number;
  dailyReflectionCount: number;
  weeklyReflectionCount: number;
  challengeReflectionCount: number;
}
