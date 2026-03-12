export type Difficulty = 'Easy' | 'Medium' | 'Hard';
export type QuestionType = 'Multiple Choice' | 'True / False' | 'Mixed';

export interface Question {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface Quiz {
  title: string;
  questions: Question[];
}

export interface QuizSettings {
  topic?: string;
  text?: string;
  file?: {
    data: string;
    mimeType: string;
    name: string;
  };
  questionCount: number;
  difficulty: Difficulty;
  questionType: QuestionType;
}
