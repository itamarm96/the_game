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

  let baseInstructions = `You are an AI generating highly engaging, romantic, and highly sexual content for a couples game.
Your tone MUST be mischievous, fun, sexually explicit, and luxurious.
Strict Constraints:
- Language MUST be Hebrew.
- Responses MUST BE EXTREMELY SHORT AND PUNCHY.
- YOU MUST OUTPUT ONE OF THE EXACT EXAMPLES FROM THE INSPIRATION DATABASE. DO NOT INVENT NEW ONES. 
- You may change 1 or 2 words to fit the current context, but the structure, title, and action MUST be identical to one of the examples.
- Use the exact same formatting: "Title: Description" (e.g., "מבט חודר: את מבצעת הליכה חושנית...").
`;

  if (type === 'task') {
    baseInstructions += `
- You are generating ONE single TASK.
- Pick ONE exact task from the list below and output it:
Inspiration List: 
\${INSPIRATION_DB.split('Rewards Inspiration')[0]}
`;
  } else {
    baseInstructions += `
- You are generating ONE single REWARD for the winner of a task.
- Pick ONE exact reward from the list below and output it:
\${isHighLevel ? 'You may pick any reward, including level 5+.' : 'You MUST NOT pick the level 5+ rewards.'}
Inspiration List:
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
