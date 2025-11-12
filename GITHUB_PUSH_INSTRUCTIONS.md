# 🔐 הוראות Push ל-GitHub

יש בעיית authentication. הנה הפתרונות:

---

## ✅ פתרון 1: Personal Access Token (מומלץ)

### שלב 1: צור Personal Access Token

1. לך ל: **https://github.com/settings/tokens**
2. לחץ **Generate new token** → **Generate new token (classic)**
3. תן שם: `Prompt Enhancer Deployment`
4. בחר scope: **repo** (סמן את כל התיבות תחת repo)
5. לחץ **Generate token**
6. **העתק את ה-token** (שמור אותו - לא תראה אותו שוב!)

### שלב 2: Push עם Token

```bash
cd /Users/omerbuzaglo/Documents/whatnow/prompt-enhancer

# החלף YOUR_TOKEN בtoken שיצרת
git push https://YOUR_TOKEN@github.com/moneyonthefloor200-cell/prompt2.git main
```

---

## ✅ פתרון 2: SSH Key (מומלץ לטווח ארוך)

### בדוק אם יש לך SSH key:
```bash
ls -la ~/.ssh
```

### אם אין, צור אחד:
```bash
ssh-keygen -t ed25519 -C "your_email@example.com"
# לחץ Enter 3 פעמים (default settings)
```

### הוסף ל-GitHub:
```bash
# העתק את ה-public key
cat ~/.ssh/id_ed25519.pub
```

1. לך ל: **https://github.com/settings/keys**
2. לחץ **New SSH key**
3. הדבק את ה-key
4. לחץ **Add SSH key**

### שנה את ה-remote ל-SSH:
```bash
git remote set-url origin git@github.com:moneyonthefloor200-cell/prompt2.git
git push -u origin main
```

---

## ✅ פתרון 3: GitHub CLI (הכי קל!)

```bash
# התקן GitHub CLI
brew install gh

# התחבר
gh auth login

# Push
git push -u origin main
```

---

## ✅ פתרון 4: צור Repository חדש בחשבון שלך

אם ה-repository הזה לא שלך:

1. לך ל: **https://github.com/new**
2. צור repository חדש בשם `prompt-enhancer-v3`
3. אז:

```bash
cd /Users/omerbuzaglo/Documents/whatnow/prompt-enhancer

# הסר את ה-remote הישן
git remote remove origin

# הוסף את החדש (החלף YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/prompt-enhancer-v3.git

# Push
git push -u origin main
```

---

## 🤔 איזה פתרון לבחור?

- **פתרון 1** (Token) - מהיר, טוב ל-one-time push
- **פתרון 2** (SSH) - הכי מאובטח, טוב לטווח ארוך
- **פתרון 3** (GitHub CLI) - הכי קל!
- **פתרון 4** (Repository חדש) - אם זה לא החשבון שלך

---

**תגיד לי איזה פתרון תרצה ואני אעזור לך!** 🚀
