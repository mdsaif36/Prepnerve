export interface CVSummary {
  primary_role: string;
  years_exp: number;
  skills: string[];
  projects: { name: string; description: string }[];
  domains: string[];
  education: string;
  summary: string;
}

export interface InterviewQuestion {
  id: number;
  type: 'intro' | 'technical' | 'behavioral' | 'situational' | 'closing';
  text: string;
  follow_up_hints: string[];
  expected_answer_points: string[];
  max_speaking_seconds: number;
}

export interface AnswerEvaluation {
  score: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
  follow_up_question: string | null;
  proceed_to_next: boolean;
  end_interview: boolean;
}

export interface InterviewAnswer {
  questionId: number;
  transcript: string;
  score: number;
  feedback: string;
  duration: number;
}

export type SessionState = 'idle' | 'preparing' | 'asking' | 'listening' | 'thinking' | 'finished';

export interface InterviewSessionData {
  id: string;
  state: SessionState;
  cvSummary: CVSummary | null;
  questions: InterviewQuestion[];
  answers: InterviewAnswer[];
  currentQuestionIndex: number;
  startTime: Date | null;
  endTime: Date | null;
  totalDuration: number;
  finalScore: number | null;
}
