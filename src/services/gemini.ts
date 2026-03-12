import { GoogleGenAI, Type, ThinkingLevel } from "@google/genai";
import { QuizSettings, Quiz } from "../types";

export async function generateQuiz(settings: QuizSettings): Promise<Quiz> {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error("Gemini API key is missing. Please add it to your environment variables and rebuild the app.");
  }

  const ai = new GoogleGenAI({ apiKey });
  const parts: any[] = [];

  let prompt = `Generate a unique, creative, and completely new quiz with exactly ${settings.questionCount} questions.\n`;
  prompt += `IMPORTANT: Generate different questions every time. Do not repeat standard questions. (Random seed: ${Math.random()})\n`;
  prompt += `Difficulty level: ${settings.difficulty}.\n`;
  prompt += `Question type: ${settings.questionType}.\n`;
  prompt += `Language: ${settings.language || 'Hindi'}. All questions, options, and explanations MUST be in this language.\n`;

  if (settings.topic) {
    prompt += `Topic: ${settings.topic}\n`;
  } else if (settings.link) {
    prompt += `Based on the content of this article link:\n${settings.link}\n`;
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
  } else if (settings.image) {
    prompt += `Based on the attached image.\n`;
    parts.push({
      inlineData: {
        data: settings.image.data,
        mimeType: settings.image.mimeType,
      },
    });
  }

  parts.push({ text: prompt });

  const config: any = {
    thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
    temperature: 0.9,
    responseMimeType: "application/json",
    responseSchema: {
      type: Type.OBJECT,
      properties: {
        title: {
          type: Type.STRING,
          description: `A catchy title for the quiz in ${settings.language || 'Hindi'}.`,
        },
        questions: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: {
                type: Type.STRING,
                description: `The question text in ${settings.language || 'Hindi'}.`,
              },
              options: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: `4 options for MCQ, or ['True', 'False'] (translated to ${settings.language || 'Hindi'}) for True/False questions.`,
              },
              correctAnswer: {
                type: Type.STRING,
                description: "The exact text of the correct option.",
              },
              explanation: {
                type: Type.STRING,
                description: `A short explanation of why the answer is correct in ${settings.language || 'Hindi'}.`,
              },
            },
            required: ["question", "options", "correctAnswer", "explanation"],
          },
          description: "The list of questions.",
        },
      },
      required: ["title", "questions"],
    },
  };

  if (settings.link) {
    config.tools = [{ urlContext: {} }];
  }

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: { parts },
    config,
  });

  const jsonStr = response.text?.trim() || "{}";
  return JSON.parse(jsonStr) as Quiz;
}
