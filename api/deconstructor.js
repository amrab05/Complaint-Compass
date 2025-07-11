// Complaint Compass AI Engine - api/deconstructor.js
// Powered by Google Gemini & Vercel Serverless Functions

const { GoogleGenerativeAI } = require("@google/generative-ai");

// Mission-critical: This handler is the entry point for the serverless function.
export default async function handler(req, res) {
  // We only accept POST requests.
  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  // Check for the API key. This is configured in Vercel Environment Variables.
  if (!process.env.GEMINI_API_KEY) {
    console.error("GEMINI_API_KEY not found.");
    return res.status(500).json({ error: "Server configuration error: API key is missing." });
  }

  // Instantiate the Gemini client.
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  try {
    const { complaint } = req.body;

    if (!complaint || typeof complaint !== 'string' || complaint.trim().length === 0) {
      return res.status(400).json({ error: "Invalid input: 'complaint' field is required and must be a non-empty string." });
    }

    // --- The Finalized AI Prompt ---
    const prompt = `
      You are "Complaint Compass," an expert AI in customer service de-escalation. Your task is to analyze a customer complaint and provide a structured response.

      Follow these instructions precisely:
      1.  **Analyze Churn Risk**: Evaluate the complaint and assign a "Churn Meter" score from 1 (very low risk) to 10 (extremely high risk of losing the customer). Provide brief reasoning for your score.
      2.  **Suggest a Reply**: Draft a concise, empathetic, and professional reply. This reply MUST follow the L.E.A.P. de-escalation framework:
          -   **Listen**: Acknowledge the customer's specific issue.
          -   **Empathize**: Show you understand their frustration.
          -   **Apologize**: Offer a sincere apology for the negative experience.
          -   **Problem-solve**: Propose a clear next step or solution.
      3.  **Output Format**: You MUST return your analysis as a single, minified JSON object. Do not include any text, markdown, or backticks before or after the JSON object.

      The JSON object must have this exact structure:
      {
        "churnMeter": {
          "score": <number>,
          "reasoning": "<string>"
        },
        "suggestedReply": "<string>"
      }

      Here is the customer complaint to analyze:
      ---
      ${complaint}
      ---
    `;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // The AI's output is a stringified JSON. We must parse it.
    const parsedJson = JSON.parse(text);

    // Send the structured data back to the frontend.
    res.status(200).json(parsedJson);

  } catch (error) {
    console.error("Error calling Gemini API or parsing response:", error);
    res.status(500).json({ error: "Failed to get analysis from AI. The model may have returned an invalid format or an error occurred." });
  }
}