import { Type } from '@google/genai';

export interface UserProfile {
    email: string;
    name: string;
    title: string;
    hospital: string;
    qualifications: string;
    avatar: string; // base64 data URL
}

export interface StoredUser extends UserProfile {
    password: string;
}

export interface AnalysisResult {
    overallImpression: string;
    keyFindings: { 
        finding: string; 
        description: string; 
    }[];
    differentialDiagnosis: string;
    recommendations: string[];
}

export interface AnalysisHistoryItem {
    id: string;
    date: string;
    imageUrl: string; // base64 data URL
    result: AnalysisResult;
}

export const analysisSchema = {
  type: Type.OBJECT,
  properties: {
    overallImpression: {
      type: Type.STRING,
      description: "A brief, high-level summary of the overall pathological picture of the liver tissue.",
    },
    keyFindings: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          finding: { 
              type: Type.STRING, 
              description: "The specific pathological feature observed (e.g., Steatosis, Lobular Inflammation, Fibrosis, Ballooning degeneration, Mallory-Denk bodies)." 
          },
          description: { 
              type: Type.STRING, 
              description: "A detailed description of the observed feature, including location, severity, and characteristics." 
          }
        },
        required: ["finding", "description"]
      },
      description: "A list of specific pathological features observed in the slide.",
    },
    differentialDiagnosis: {
      type: Type.STRING,
      description: "A differential diagnosis or a list of potential diagnoses based on the key findings. Correlate findings to possible conditions like NAFLD, NASH, alcoholic liver disease, or viral hepatitis.",
    },
    recommendations: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Recommendations for further tests, special stains (e.g., Trichrome, Reticulin), immunohistochemistry, or clinical correlation needed to confirm the diagnosis.",
    },
  },
  required: ["overallImpression", "keyFindings", "differentialDiagnosis", "recommendations"],
};
