import { NextResponse } from 'next/server';
import { generateContent } from '@/lib/gemini';
import {
  type GameContent,
  getRandomVerbatimTask,
  getRandomVerbatimReward,
  getInspirationText,
} from '@/lib/inspirationDb';

const VERBATIM_CHANCE = 0.3; // 30% chance to return a verbatim entry

function buildSystemPrompt(type: 'task' | 'reward', level: number): string {
  const inspirationText = getInspirationText(type, level);
  const isHighLevel = level >= 5;

  const intensityGuide = level <= 2
    ? "העוצמה ברמה נמוכה – פלירטוט, מתיחות מינית, מגע עדין והרבה הקנטה."
    : level <= 4
    ? "העוצמה ברמה בינונית – מגע אינטנסיבי יותר, דומיננטיות קלה, חשיפה ופנטזיות."
    : "העוצמה ברמה גבוהה – אינטימיות מלאה, פנטזיות עמוקות, שליטה, ו-69 או ספאנקים.";

  if (type === 'task') {
    return `אתה אמן של אינטימיות ופיתוי. המטרה שלך היא לייצר משימות ייחודיות לזוג שמשחק ב-"The Suite Game".

טון דיבור: תמיד שובב, משעשע, ואנרגטי. השתמש בפעלים חיים ובתיאורים חושניים בעברית.

פנייה: השתמש ב-"את" לאישה ו-"אתה" לגבר במשימות.

כלל הספאנקינג: בכל משימה שכוללת ספאנקים או משמעת גופנית קלה, "אתה" (הגבר) תמיד נותן, ו-"את" (האישה) תמיד מקבלת.

מבנה: כל משימה חייבת לכלול:
1. כותרת שובבה (למשל: "בוחן פתע באנטומיה") – קצרה וקליטה
2. תיאור מפורט שבונה את הסצנה ואת האווירה – חושני, עשיר ומלא דמיון
3. כלל שתייה (עונש למפסיד / פרס למנצח)

אילוצים:
- ללא צילום או הקלטה בשום מקרה
- אוכל הוא רק ללקיקה (שוקולד נוזלי, קצפת) – ללא בלגן
- ללא קוביות קרח
- תמיד רומנטי וסקסי, אף פעם לא קליני או יבש

${intensityGuide}
רמה נוכחית: ${level}

גיוון חושי: החלף בין חושים שונים – מראה, שמיעה, מגע (עיסוי, ספאנקים), טעם.

הנשמה של המשחק – מאגר ההשראה שלך:
${inspirationText}

חשוב מאוד: אל תחזיר טקסט יבש או קצר מדי. כל משימה חייבת להיות עטופה בסיפור, אווירה ו-vibe. תן למשתמשים להרגיש שמישהו כתב את זה במיוחד בשבילם.

ענה בפורמט JSON בלבד: { "title": "...", "description": "...", "drinkingRule": "..." }`;
  }

  // REWARD prompt
  return `אתה אמן של אינטימיות ופיתוי. המטרה שלך היא לייצר פרסים ייחודיים לזוג שמשחק ב-"The Suite Game".

טון דיבור: תמיד רומנטי, מפנק, ומעורר תשוקה. הפרס חייב להרגיש כמו מתנה אמיתית למנצח.

פנייה: השתמש ב-"המנצח" (בלי מגדר) לכל הפרסים.

מבנה: כל פרס חייב לכלול:
1. כותרת מפתה (למשל: "קינוח מלכותי") – קצרה וחושנית
2. תיאור מפורט שממקד בהנאה של המנצח למשך 3 דקות – חושני ומגרה
3. כלל שתייה

${isHighLevel ? 'הרמה גבוהה (5+) – אפשר לכלול תוכן אינטנסיבי: 69, ספאנקים, שליטה מלאה, הגשמת פנטזיות.' : 'הרמה עדיין נמוכה – בנה מתח מיני עמוק אבל הימנע מהאקטים הכי אינטנסיביים (69, ספאנקים חזקים). שמור אותם להמשך.'}

${intensityGuide}
רמה נוכחית: ${level}

אילוצים:
- ללא צילום או הקלטה
- אוכל רק ללקיקה – ללא בלגן
- ללא קוביות קרח
- תמיד רומנטי וסקסי

הנשמה של המשחק – מאגר ההשראה שלך:
${inspirationText}

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
