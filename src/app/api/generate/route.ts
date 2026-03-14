import { NextResponse } from 'next/server';

const TASKS = [
  "מבט חודר: את מבצעת הליכה חושנית, מסתובבת ומתכופפת. את חייבת לשמור איתו על קשר עין רציף.",
  "רק להסתכל, לא לגעת: את במופע פרטי, מותר לך לגעת בו כמה שתרצי, אבל לו אסור לגעת בך או לדבר והידיים מאחורי הגב.",
  "שיעור בתיאוריה: את מתיישבת מולו ומפרטת 3 דברים שאת מתכננת לעשות לו.",
  "וידוי תחת אש: אתה צריך ללחוש לה פנטזיה בזמן שהיא מענגת אותך."
];

// Level 1-4 rewards
const NORMAL_REWARDS = [
  "כרטיס פתוח: המנצח בוחר כל דבר שמתחשק לו.",
  "חושך מוחלט: המנצח מכסה את עיני המפסיד ומענג אותו ל-3 דקות."
];

// Level 5+ rewards (Spicier)
const HIGH_LEVEL_REWARDS = [
  "69 מלא"
];

function getRandomItem(array: string[]) {
  return array[Math.floor(Math.random() * array.length)];
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, level } = body; // type is 'task' or 'reward'

    if (!type || (type !== 'task' && type !== 'reward')) {
      return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });
    }

    const currentLevel = parseInt(level) || 1;
    let result = "";

    if (type === 'task') {
      result = getRandomItem(TASKS);
    } else {
      // For rewards
      if (currentLevel >= 5) {
        // At level 5+, mix all rewards together
        const allRewards = [...NORMAL_REWARDS, ...HIGH_LEVEL_REWARDS];
        result = getRandomItem(allRewards);
      } else {
        result = getRandomItem(NORMAL_REWARDS);
      }
    }

    // Simulate a slight delay to keep the loading animation experience
    await new Promise(resolve => setTimeout(resolve, 800));

    return NextResponse.json({ result });
  } catch (error: any) {
    console.error("API Route Error:", error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
