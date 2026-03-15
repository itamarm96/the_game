import { NextResponse } from 'next/server';
import { generateContent } from '@/lib/gemini';
import {
  type GameContent,
  getRandomVerbatimTask,
  getRandomVerbatimReward,
  getInspirationText,
} from '@/lib/inspirationDb';

const VERBATIM_CHANCE = 0.55; // 55% chance to return a verbatim entry

function buildSystemPrompt(type: 'task' | 'reward', level: number): string {
  const inspirationText = getInspirationText(type, level);
  const isHighLevel = level >= 5;

  const intensityGuide = level <= 2
    ? "העוצמה ברמה נמוכה – פלירטוט, מתיחות מינית, מגע עדין והרבה הקנטה."
    : level <= 4
    ? "העוצמה ברמה בינונית – מגע אינטנסיבי יותר, דומיננטיות קלה, חשיפה ופנטזיות."
    : "העוצמה ברמה גבוהה – אינטימיות מלאה, פנטזיות עמוקות, שליטה, ו-69 או ספאנקים.";

  if (type === 'task') {
    return `אתה כותב משימות לזוג שמשחק ב-"The Suite Game". אתה חייב לכתוב בסגנון זהה לחלוטין לדוגמאות.

כללים מחייבים:
- חקה את הסגנון של הדוגמאות מילה במילה: אותם ביטויים, אותו אורך, אותה מבנה משפטים.
- התחל תמיד עם הנחיה ישירה: "את הופכת ל...", "אתה בוחר...", "את ניגשת אליו...", "אתה מבצע...".
- כל משפט = הוראה ספציפית. אין תיאורים עודפים, אין מטאפורות, אין שירה.
- הכותרת: 2-4 מילים בלבד. קליטה ושובבה.
- כלל השתייה: 1-2 משפטים. תמיד "אתה שותה" / "את שותה" בסוף.
- פנייה: "את" לאישה, "אתה" לגבר.
- כלל ספאנקים: "אתה" נותן, "את" מקבלת.
- אילוצים: ללא צילום. אוכל רק ללקיקה. ללא קוביות קרח.

${intensityGuide}

דוגמה מדויקת לפלט שאתה חייב לחקות:
{
  "title": "בידוק בטחוני",
  "description": "את עומדת בפישוק קל עם הידיים לצדדים. אתה מבצע עליה חיפוש גופני איטי, פולשני ויסודי בכל פינה בגוף שלה. האתגר שלך את הוא לעמוד ולא לזוז – אסור לך לזוז, להתכווץ, להזיז את הידיים או להגיב למגע שלו בשום צורה.",
  "drinkingRule": "את זזת או הגבת למגע? את שותה. עמדת בצייתנות בחיפוש החודרני? אתה שותה."
}

עוד דוגמה:
{
  "title": "שירות חדרים VIP",
  "description": "את ניגשת אליו על ארבע, לאט ובחושניות, כמו חיה שמתקרבת לטרף שלה. המשימה שלך היא להכין לו את כוס המשקה שלו, ולהשקות אותו כשאת על הברכיים.",
  "drinkingRule": "המשקה נשפך בדרך אל היעד? את שותה. הוגש בהצלחה לתוך הפה שלו? אתה שותה."
}

מאגר ההשראה המלא:
${inspirationText}

צור משימה חדשה שונה מהדוגמאות אבל באותו סגנון, אורך וניסוח בדיוק.
ענה בפורמט JSON בלבד.`;
  }

  // REWARD prompt
  return `אתה כותב פרסים לזוג שמשחק ב-"The Suite Game". אתה חייב לכתוב בסגנון זהה לחלוטין לדוגמאות.

כללים מחייבים:
- חקה את הסגנון של הדוגמאות מילה במילה: אותם ביטויים, אותו אורך, אותה מבנה משפטים.
- פנייה: "המנצח" ו-"המפסיד" בלבד. בלי מגדר.
- התחל עם מה המנצח מקבל, ואז מה המפסיד חייב לעשות, ואז הכללים.
- הכותרת: 2-4 מילים. מפתה וקליטה.
- כלל השתייה: משפט אחד קצר.
- אילוצים: ללא צילום. אוכל רק ללקיקה. ללא קוביות קרח.

${isHighLevel ? 'רמה 5+ – אפשר 69, ספאנקים, שליטה, הגשמת פנטזיות.' : 'עדיין לא רמה 5 – מתח מיני בלי 69, ספאנקים חזקים או שליטה קיצונית.'}

דוגמה מדויקת לפלט שאתה חייב לחקות:
{
  "title": "בובה על חוט",
  "description": "המנצח מקבל שליטה מלאה על גופו של המפסיד. במשך 3 דקות, למפסיד אסור לזוז, לשנות תנוחה או לגעת בעצמו ללא אישור מפורש. המנצח יכול להזיז ולעצב את המפסיד בכל תנוחה שמתחשקת לו.",
  "drinkingRule": "המפסיד זז בלי אישור? שותה שוט עונשין."
}

מאגר ההשראה המלא:
${inspirationText}

צור פרס חדש שונה מהדוגמאות אבל באותו סגנון, אורך וניסוח בדיוק.
ענה בפורמט JSON בלבד.`;
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
      ? `צור משימה חדשה לזוג. רמה ${level}. חקה את סגנון הדוגמאות בדיוק. ענה בJSON.`
      : `צור פרס חדש למנצח. רמה ${level}. חקה את סגנון הדוגמאות בדיוק. ענה בJSON.`;

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
