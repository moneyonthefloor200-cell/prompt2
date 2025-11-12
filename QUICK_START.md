# ⚡ Quick Start - התחלה מהירה

## 🚀 3 צעדים להפעלה

### 1️⃣ הגדר API Key
```bash
cd /Users/omerbuzaglo/Documents/whatnow/prompt-enhancer
echo "OPENAI_API_KEY=sk-your-actual-key-here" > .env.local
```

💡 **קבל API Key:** https://platform.openai.com/api-keys

### 2️⃣ הפעל את השרת
```bash
npm run dev
```

### 3️⃣ פתח בדפדפן
```
http://localhost:3000
```

---

## ✅ בדיקה מהירה

נסה את הפרומפט הזה:
```
כתוב לי מאמר על בינה מלאכותית
```

אמור לקבל פרומפט משופר תוך 3-5 שניות!

---

## 📋 פקודות שימושיות

### פיתוח:
```bash
npm run dev          # הפעל בסביבת פיתוח
npm run build        # בנה לפרודקשן
npm run start        # הפעל פרודקשן
npm run lint         # בדוק קוד
```

### ניקוי:
```bash
rm -rf .next         # נקה build cache
rm -rf node_modules  # נקה תלויות
npm install          # התקן מחדש
```

### Git:
```bash
git add .
git commit -m "Initial commit"
git push
```

---

## 🐛 פתרון בעיות מהיר

### ❌ "API key not configured"
```bash
# וודא שיצרת .env.local
cat .env.local

# אם לא קיים, צור:
echo "OPENAI_API_KEY=sk-your-key" > .env.local
```

### ❌ "Module not found"
```bash
# התקן תלויות מחדש
rm -rf node_modules package-lock.json
npm install
```

### ❌ "Port 3000 already in use"
```bash
# שנה פורט
npm run dev -- -p 3001

# או הרוג את התהליך
lsof -ti:3000 | xargs kill -9
```

### ❌ "Failed to enhance prompt"
- בדוק שיש לך קרדיט ב-OpenAI
- בדוק שה-API Key תקין
- בדוק חיבור לאינטרנט

---

## 📁 קבצים חשובים

```
.env.local           # API KEY (צור אותו!)
app/page.tsx         # UI ראשי
app/api/enhance/route.ts  # לוגיקת השיפור
README.md            # תיעוד מלא
```

---

## 💡 טיפ מהיר

רוצה לשנות את המודל? ערוך את `app/api/enhance/route.ts`:

```typescript
model: 'gpt-4o',  // שנה ל-'gpt-4-turbo' או אחר
temperature: 0.7,  // 0 = דטרמיניסטי, 1 = יצירתי
```

---

## 🎯 דוגמאות לניסוי

1. **פשוט:** "כתוב סיפור"
2. **טכני:** "עזור לי עם React"
3. **עסקי:** "צור תוכנית שיווק"
4. **חינוכי:** "הסבר quantum computing"

---

## 📚 קרא עוד

- **README.md** - תיעוד מלא
- **EXAMPLES.md** - דוגמאות מפורטות
- **PROJECT_SUMMARY.md** - סקירה כללית

---

**זהו! אתה מוכן 🎉**

נתקעת? קרא את **SETUP_GUIDE.md** לפרטים נוספים.
