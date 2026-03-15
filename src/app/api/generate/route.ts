import { NextResponse } from 'next/server';
import { generateContent } from '@/lib/gemini';
import {
  type GameContent,
  getRandomVerbatimTask,
  getRandomVerbatimReward,
  getInspirationText,
} from '@/lib/inspirationDb';

const VERBATIM_CHANCE = 0.4; // 40% chance to return a verbatim entry

function buildSystemPrompt(type: 'task' | 'reward', level: number): string {
  const inspirationText = getInspirationText(type, level);
  const isHighLevel = level >= 5;

  const intensityGuide = level <= 2
    ? "העוצמה ברמה נמוכה – פלירטוט, מתיחות מינית, מגע עדין והרבה הקנטה."
    : level <= 4
    ? "העוצמה ברמה בינונית – מגע אינטנסיבי יותר, דומיננטיות קלה, חשיפה ופנטזיות."
    : "העוצמה ברמה גבוהה – אינטימיות מלאה, פנטזיות עמוקות, שליטה, ו-69 או ספאנקים.";

  if (type === 'task') {
    return `אתה כותב משימות לזוג שמשחק ב-"The Suite Game".

כללים קריטיים לסגנון – חובה לעקוב:
- כתוב בדיוק כמו הדוגמאות למטה. אותו אורך, אותו טון, אותו מבנה.
- המשימה חייבת להיות ישירה ותכליתית: מי עושה מה, איך, ומה הכללים.
- אל תכתוב סיפורים, משלים או תיאורים פואטיים. אל תוסיף מטאפורות מיותרות.
- שמור על שפה חושנית ושובבה אבל תכל'ס – הוראות ברורות, לא פרוזה.
- הכותרת: 2-4 מילים, קליטה ושובבה (כמו "בוחן פתע", "שירות חדרים VIP", "משמעת נוקשה").
- התיאור: 3-6 משפטים מקסימום. פותח עם מה קורה, ממשיך עם הכללים.
- כלל השתייה: 1-2 משפטים קצרים. תמיד "אתה שותה" / "את שותה" / "שניכם שותים".

פנייה: "את" לאישה, "אתה" לגבר.
כלל הספאנקינג: "אתה" תמיד נותן, "את" תמיד מקבלת.

אילוצים: ללא צילום. אוכל רק ללקיקה. ללא קוביות קרח.

${intensityGuide}

הדוגמאות הבאות הן הסגנון המדויק שאתה חייב לחקות:
${inspirationText}

צור משימה חדשה שונה מהדוגמאות אבל באותו סגנון בדיוק.
ענה בפורמט JSON בלבד: { "title": "...", "description": "...", "drinkingRule": "..." }`;
  }

  // REWARD prompt
  return `אתה כותב פרסים לזוג שמשחק ב-"The Suite Game".

כללים קריטיים לסגנון – חובה לעקוב:
- כתוב בדיוק כמו הדוגמאות למטה. אותו אורך, אותו טון, אותו מבנה.
- הפרס חייב להיות ישיר ותכליתי: מה המנצח מקבל, מה המפסיד עושה, מה הכללים.
- אל תכתוב סיפורים או פרוזה פואטית. שמור על שפה חושנית אבל תכל'ס.
- הכותרת: 2-4 מילים, מפתה וקליטה (כמו "קינוח מלכותי", "בובה על חוט", "ספא של חטאים").
- התיאור: 3-5 משפטים מקסימום. ישיר וחושני.
- כלל השתייה: משפט אחד קצר.

פנייה: השתמש ב-"המנצח" ו-"המפסיד" (בלי מגדר).

${isHighLevel ? 'רמה 5+ – אפשר תוכן אינטנסיבי: 69, ספאנקים, שליטה, הגשמת פנטזיות.' : 'עדיין לא רמה 5 – בנה מתח מיני אבל בלי 69, ספאנקים חזקים או שליטה קיצונית.'}

אילוצים: ללא צילום. אוכל רק ללקיקה. ללא קוביות קרח.

הדוגמאות הבאות הן הסגנון המדויק שאתה חייב לחקות:
${inspirationText}

צור פרס חדש שונה מהדוגמאות אבל באותו סגנון בדיוק.
ענה בפורמט JSON בלבד: { "title": "...", "description": "...", "drinkingRule": "..." }`;
}

function parseGameContent(text: string | undefined): GameContent {
  if (!text) throw new Error('Empty response from Gemini');

  // Try to extract JSON from the response (might be wrapped in markdown code blocks)
  let jsonStr = text.trim();
  const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    jsonStr = jsonMatch[1].trim();
  }

  // If no code block, try to find raw JSON object
  const objectMatch = jsonStr.match(/\{[\s\S]*\}/);
  if (objectMatch) {
    jsonStr = objectMatch[0];
  }

  const parsed = JSON.parse(jsonStr);

  if (!parsed.title || !parsed.description || !parsed.drinkingRule) {
    throw new Error('Missing required fields in Gemini response');
  }

  return {
    title: parsed.title,
    description: parsed.description,
    drinkingRule: parsed.drinkingRule,
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, level: levelRaw } = body;
    const level = parseInt(levelRaw) || 1;

    if (!type || (type !== 'task' && type !== 'reward')) {
      return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });
    }

    // ── Verbatim Mode (30% chance) ──
    if (Math.random() < VERBATIM_CHANCE) {
      const verbatim = type === 'task'
        ? getRandomVerbatimTask()
        : getRandomVerbatimReward(level);
      return NextResponse.json({ result: verbatim });
    }

    // ── Creative Mode (70% chance) — call Gemini ──
    const systemInstruction = buildSystemPrompt(type, level);
    const userPrompt = type === 'task'
      ? `צור משימה חדשה, יצירתית ושובבה לזוג. רמה ${level}. ענה בJSON בלבד.`
      : `צור פרס חדש, מפנק ומגרה למנצח. רמה ${level}. ענה בJSON בלבד.`;

    const result = await generateContent(systemInstruction, userPrompt);
    const parsed = parseGameContent(result);

    return NextResponse.json({ result: parsed });
  } catch (error: any) {
    console.error("API Route Error:", error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
