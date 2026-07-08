import * as db from '../config/db.js';
import { getAiChatResponse } from '../config/openAi.js';

export async function chatWithCoach(req, res, next) {
  const { messages } = req.body; // Expects array of { role, content }
  const userId = req.user.id;

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ success: false, message: 'Messages array is required.' });
  }

  try {
    // 1. Fetch user profile context
    const users = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
    const userProfile = users[0];

    // 2. Build personalized system context for AI Coach
    let systemInstructions = 
      'You are NutraWell AI Coach, a supportive and professional nutrition expert. ' +
      'Keep responses warm, encouraging, conversational, and health-focused. ' +
      'Ensure you provide practical and actionable food or workout advice.';

    if (userProfile) {
      systemInstructions += `\n\n[USER PROFILE INFORMATION]
- Name: ${userProfile.name}
- Age: ${userProfile.age || 'Not provided'} years old
- Gender: ${userProfile.gender || 'Not provided'}
- Weight: ${userProfile.weight || 'Not provided'} kg
- Height: ${userProfile.height || 'Not provided'} cm
- Activity Level: ${userProfile.activity_level || 'sedentary'}
- Wellness Goal: ${userProfile.goal || 'maintain weight'}
- Daily Calorie Target: ${userProfile.daily_calorie_target || 2000} kcal/day`;
    }

    // Insert system instructions at the beginning of the messages array
    const chatMessages = [
      { role: 'system', content: systemInstructions },
      ...messages
    ];

    // 3. Query AI Adapter
    const replyText = await getAiChatResponse(chatMessages);

    res.status(200).json({
      success: true,
      message: replyText
    });
  } catch (err) {
    next(err);
  }
}
