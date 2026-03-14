import { NextResponse } from 'next/server';
import { generateContent } from '@/lib/gemini';

const INSPIRATION_DB = `
Tasks Inspiration (Tone: Mischievous, fun & Sexy):
1. מבט חודר: את מבצעת הליכה חושנית, מסתובבת ומתכופפת. את חייבת לשמור איתו על קשר עין רציף.
2. רק להסתכל, לא לגעת: את במופע פרטי, מותר לך לגעת בו כמה שתרצי, אבל לו אסור לגעת בך או לדבר והידיים מאחורי הגב.
3. שיעור בתיאוריה: את מתיישבת מולו ומפרטת 3 דברים שאת מתכננת לעשות לו.
4. וידוי תחת אש: אתה צריך ללחוש לה פנטזיה בזמן שהיא מענגת אותך.
(No photography, no messy food/ice cubes. Use words like אתה/את properly for tasks.)

Rewards Inspiration (Tone: Romantic, sexy, luxurious):
1. כרטיס פתוח: המנצח בוחר כל דבר שמתחשק לו.
2. חושך מוחלט: המנצח מכסה את עיני המפסיד ומענג אותו ל-3 דקות.
3. 69 מלא (Level 5+).
(Always refer to the winner as "המנצח" without gender. High intensity locked behind Level 5).
`;

function buildSystemPrompt(type: 'task' | 'reward', levelString: string) {
  const level = parseInt(levelString) || 1;
  const isHighLevel = level >= 5;

  let baseInstructions = `You are an AI generating highly engaging, romantic, and sexy content for a couples game.
Your tone should be mischievous, fun, sexy, and luxurious.
Strict Constraints:
- Language MUST be Hebrew.
- Responses MUST BE EXTREMELY SHORT, PUNCHY, and DIRECT. Maximum 1-2 short sentences. Do not over-explain or add unnecessary fluff.
- NO tasks involving taking photos or recording videos.
- NO messy food limits (only light things like chocolate or cream for licking, NO ice cubes).
`;

  if (type === 'task') {
    baseInstructions += `
- You are generating ONE single TASK.
- Address the man as "אתה" and the woman as "את". Make sure the instructions clearly dictate who does what.
- Use the following inspiration purely for style/tone, generate something NEW and UNIQUE every time.
Inspriation: 
\${INSPIRATION_DB.split('Rewards Inspiration')[0]}
`;
  } else {
    baseInstructions += `
- You are generating ONE single REWARD for the winner of a task.
- Use the term "המנצח" (The Winner) instead of gender-specific pronouns.
- \${isHighLevel ? 'You CAN generate intense/deep intimacy rewards (e.g., 69, Spanking, etc.).' : 'You MUST NOT generate intense rewards (e.g., no 69, no spanking). Keep it sensual but light (massages, teasing, kissing).'}
- Use the following inspiration purely for style/tone, generate something NEW and UNIQUE every time.
Inspriation:
\${INSPIRATION_DB.split('Rewards Inspiration')[1]}
`;
  }

  return baseInstructions;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, level } = body; // type is 'task' or 'reward'

    if (!type || (type !== 'task' && type !== 'reward')) {
      return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });
    }

    const systemInstruction = buildSystemPrompt(type, level);
    const userPrompt = type === 'task' 
      ? "Generate a new sexy, creative task for the couple. Respond with only the task text."
      : "Generate a new sexy reward for the winner. Respond with only the reward text.";

    const result = await generateContent(systemInstruction, userPrompt);

    return NextResponse.json({ result });
  } catch (error: any) {
    console.error("API Route Error:", error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
