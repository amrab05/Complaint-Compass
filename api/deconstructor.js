// Complaint Compass AI Engine - api/deconstructor.js v1.3 (Final)
// Model: Updated to gemini-1.5-flash-latest for API compliance.
// Logic: Retains aggressive JSON extraction for reliability.

const { GoogleGenerativeAI } = require("@google/generative-ai");

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  if (!process.env.GEMINI_API_KEY) {
    console.error("GEMINI_API_KEY not found.");
    return res.status(500).json({ error: "Server configuration error: API key is missing." });
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  // --- FINAL FIX: Use the current, correct model name ---
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

  try {
    const { complaint } = req.body;

    if (!complaint || typeof complaint !== 'string' || complaint.trim().length === 0) {
      return res.status(400).json({ error: "Invalid input: 'complaint' field is required." });
    }

    const prompt = `
      You are an API endpoint that only returns JSON. Do not write any conversational text, preamble, or explanation. Your entire response must be a single, minified JSON object.

      Analyze the following customer complaint according to these rules:
      1.  **Churn Risk Analysis**: Assign a "Churn Meter" score (1-10) and provide a brief justification.
      2.  **L.E.A.P. Reply**: Draft a reply using the L.E.A.P. framework (Listen, Empathize, Apologize, Problem-solve).

      CRITICAL: Your output MUST be ONLY a minified JSON object with this exact structure. Do not deviate.
      {"churnMeter":{"score":<number>,"reasoning":"<string>"},"suggestedReply":"<string>"}

      Customer Complaint:
      ---
      ${complaint}
      ---
    `;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    // --- AGGRESSIVE EXTRACTION (v1.2 Logic - Retained) ---
    const startIndex = text.indexOf('{');
    const endIndex = text.lastIndexOf('}');

    if (startIndex === -1 || endIndex === -1) {
        console.error("AI response did not contain a JSON object. Response:", text);
        throw new Error("AI response did not contain a valid JSON object.");
    }
    
    const jsonString = text.substring(startIndex, endIndex + 1);
    
    const parsedJson = JSON.parse(jsonString);
    res.status(200).json(parsedJson);

  } catch (error) {
    console.error("Error during AI analysis:", error);
    res.status(500).json({ error: `AI model returned invalid data or an error occurred. Details: ${error.message}` });
  }
}