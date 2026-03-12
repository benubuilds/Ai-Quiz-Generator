import { GoogleGenAI, Type } from "@google/genai";
import { QuizSettings, Quiz } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateQuiz(settings: QuizSettings): Promise<Quiz> {
  const parts: any[] = [];

  let prompt = `Generate a quiz with exactly ${settings.questionCount} questions.\n`;
  prompt += `Difficulty level: ${settings.difficulty}.\n`;
  prompt += `Question type: ${settings.questionType}.\n`;

  if (settings.topic) {
    prompt += `Topic: ${settings.topic}\n`;
  } else if (settings.text) {
    prompt += `Based on the following text:\n${settings.text}\n`;
  } else if (settings.file) {
    prompt += `Based on the attached document.\n`;
    parts.push({
      inlineData: {
        data: settings.file.data,
        mimeType: settings.file.mimeType,
      },
    });
  }

  parts.push({ text: prompt });

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: { parts },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: {
            type: Type.STRING,
            description: "A catchy title for the quiz.",
          },
          questions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                question: {
                  type: Type.STRING,
                  description: "The question text.",
                },
                options: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "4 options for MCQ, or ['True', 'False'] for True/False questions.",
                },
                correctAnswer: {
                  type: Type.STRING,
                  description: "The exact text of the correct option.",
                },
                explanation: {
                  type: Type.STRING,
                  description: "A short explanation of why the answer is correct.",
                },
              },
              required: ["question", "options", "correctAnswer", "explanation"],
            },
            description: "The list of questions.",
          },
        },
        required: ["title", "questions"],
      },
    },
  });

  const jsonStr = response.text?.trim() || "{}";
  return JSON.parse(jsonStr) as Quiz;
}
