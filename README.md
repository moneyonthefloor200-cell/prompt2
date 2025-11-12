# ✨ Prompt Enhancer - משפר פרומפטים מקצועי

אתר מתקדם שהופך כל פרומפט פשוט לפרומפט מקצועי, מדויק ואפקטיבי באמצעות טכניקות Prompt Engineering מתקדמות.

## 🎯 למה זה עובד?

המערכת משתמשת בפריימוורקים מוכחים ומחקר מעמיק ב-Prompt Engineering:

### 📚 הפריימוורקים שבשימוש:

1. **CRISPE Framework**
   - **Context**: הוספת הקשר ורקע רלוונטי
   - **Role**: הגדרת תפקיד מומחה מתאים
   - **Instructions**: הבהרת המשימה בצורה מדויקת
   - **Specifics**: הוספת פרטים, פורמט, אילוצים
   - **Examples**: דוגמאות כשצריך (Few-Shot Learning)

2. **Chain-of-Thought (CoT)**
   - הוראות לחשיבה שלב-אחר-שלב
   - בקשה לשלבי חשיבה ביניים
   - שיפור דיוק התשובות

3. **RISEN Method**
   - Role, Input, Steps, Examples, Nuance
   - מתאים למשימות מורכבות

### 🔬 למה זה מדויק ועובד בכל פעם?

1. **ניתוח שיטתי**: המערכת מנתחת כל פרומפט ומזהה מה חסר
2. **AI חזק**: שימוש ב-GPT-4 עם meta-prompt מושלם
3. **עקביות**: הגדרות מאוזנות (temperature 0.7) לאיכות קבועה
4. **מבוסס מחקר**: כל הטכניקות מבוססות על מחקרים ופרקטיקות מוכחות מ-2024-2025

## 🚀 התקנה והפעלה

### דרישות מקדימות
- Node.js 18+ 
- npm או yarn
- OpenAI API Key

### שלבי התקנה:

1. **שכפל את הפרויקט**
```bash
cd prompt-enhancer
```

2. **התקן תלויות**
```bash
npm install
```

3. **הגדר את ה-API Key**

צור קובץ `.env.local` בתיקיית הפרויקט:
```bash
cp env.example .env.local
```

ערוך את הקובץ `.env.local` והוסף את ה-API Key שלך:
```
OPENAI_API_KEY=your_openai_api_key_here
```

קבל API Key מ: [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)

4. **הפעל את השרת**
```bash
npm run dev
```

5. **פתח בדפדפן**
```
http://localhost:3000
```

## 💡 איך להשתמש?

1. הכנס את הפרומפט המקורי שלך בצד שמאל
2. לחץ על "שפר פרומפט"
3. קבל פרומפט משופר מקצועי בצד ימין
4. ראה הסבר מפורט על מה שופר
5. העתק את הפרומפט המשופר ושתמש בו

## ✨ תכונות מתקדמות!

### 🚀 Streaming Responses
- תוצאות בזמן אמת - רואה את הפרומפט נבנה מילה אחרי מילה
- חוויה מהירה ואינטראקטיבית כמו ChatGPT
- אין יותר המתנה - תוצאות מיידיות!

### 📚 History Panel + Export/Import
- שמירה אוטומטית של 50 הפרומפטים האחרונים
- **ייצוא ל-JSON** - גיבוי והעברה בין מכשירים
- **ייצוא ל-CSV** - ניתוח ב-Excel/Google Sheets
- **ייבוא מ-JSON** - שחזור והעברת נתונים
- מחיקה של פרומפטים בודדים או כל ההיסטוריה

### 🎨 Custom Templates (חדש!)
- **צור תבניות משלך** - שמור פרומפטים שאתה משתמש בהם הרבה
- **ערוך ומחק** - ניהול מלא של התבניות
- **ארגון לפי קטגוריות** - סדר תבניות לפי נושאים
- **שימוש מהיר** - לחיצה אחת לטעינת תבנית

### ⌨️ Keyboard Shortcuts
- `Ctrl/Cmd + Enter` - שלח לשיפור
- `Ctrl/Cmd + K` - נקה הכל
- עבודה מהירה ויעילה!

### 📊 Character Counter
- מונה תווים בזמן אמת
- מכפיל שיפור (×5, ×10, ×17...)
- הבנה כמה הפרומפט השתפר

### 📈 Progress Indicator
- "מנתח את הפרומפט..."
- "מוסיף Context ו-Role..."
- "מגדיר Instructions..."
- "הושלם! ✨"

### 📝 Quick Templates
- 6 תבניות מוכנות (קוד, כתיבה, עסקי, הוראה, יצירתי, ניתוח)
- התחל מהר עם תבנית
- ערוך והתאם לצרכים שלך

**קרא עוד:**
- [NEW_FEATURES_V2.md](NEW_FEATURES_V2.md) - 🆕 Custom Templates + Export/Import
- [NEW_FEATURES.md](NEW_FEATURES.md) - Streaming + History
- [ADVANCED_FEATURES.md](ADVANCED_FEATURES.md) - תכונות מתקדמות

---

## 🎨 טכנולוגיות

- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **TailwindCSS** - Styling
- **shadcn/ui** - UI components
- **OpenAI GPT-4** - AI enhancement with streaming
- **Lucide React** - Icons
- **Server-Sent Events** - Real-time streaming

## 📖 דוגמאות

### לפני:
```
כתוב לי מאמר על AI
```

### אחרי:
```
You are an expert technology journalist with 10 years of experience covering artificial intelligence. Write a comprehensive 800-word article about the current state of AI technology in 2024.

Context: This article is for a general tech-savvy audience who understands basic technology concepts but may not be AI experts.

Structure your article as follows:
1. Introduction: Current AI landscape
2. Major breakthroughs in the past year
3. Practical applications being used today
4. Challenges and limitations
5. Future outlook for the next 2-3 years

Tone: Professional yet accessible, avoiding excessive jargon. Use concrete examples and real-world applications. Include at least 3 specific examples of AI applications.

Think step by step: First outline the key points for each section, then develop each section with supporting details and examples.
```

## 🔧 הגדרות מתקדמות

ניתן לשנות את הגדרות ה-AI בקובץ `app/api/enhance/route.ts`:

- `model`: מודל OpenAI (ברירת מחדל: gpt-4o)
- `temperature`: רמת יצירתיות (ברירת מחדל: 0.7)
- `max_tokens`: אורך מקסימלי (ברירת מחדל: 3000)

## 📚 מקורות ומחקר

הפרויקט מבוסס על מחקרים ופרקטיקות מובילות:
- CRISPE Framework
- Chain-of-Thought Prompting (Wei et al.)
- Few-Shot Learning techniques
- RISEN methodology
- Meta-prompting strategies

## 🤝 תרומה

רוצה לשפר? Pull Requests מתקבלים בברכה!

## 📄 רישיון

MIT License

## 🌟 תכונות עתידיות

- [x] שמירת היסטוריית פרומפטים ✅
- [x] תבניות מותאמות אישית ✅
- [x] ייצוא לפורמטים שונים (JSON, CSV) ✅
- [ ] סנכרון ענן (Google Drive / Dropbox)
- [ ] שיתוף תבניות - marketplace
- [ ] השוואה בין מספר מודלים (GPT-4, Claude, Gemini)
- [ ] A/B testing של meta-prompts
- [ ] Chrome/VSCode extension

---

**נבנה עם ❤️ באמצעות טכניקות Prompt Engineering מתקדמות**
