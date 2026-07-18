# Storage Explorer Client

Frontend React + TypeScript עבור שרת האחסון הקיים.

## תכונות

- צפייה בתיקיות וקבצים
- פתיחת תיקיות
- יצירת תיקיות
- יצירת/העלאת קבצים
- פתיחת קובץ טקסט לעריכה
- שמירה מחדש לשרת
- ניווט רספונסיבי למחשב ומובייל

## דרישות מוקדמות

- Node.js 18+
- השרת הראשי צריך להיות רץ על port 3000

## התקנה

```bash
cd frontend
npm install
```

## הפעלה

### עבור הפיתוח

```bash
cd frontend
npm run dev
```

היישום ייפתח בכתובת:

```text
http://localhost:5173/
```

## חיבור לשרת

ה frontend משתמש ב-Vite proxy כדי להיקשר לשרת בכתובת:

```text
http://localhost:3000
```

## בנייה לייצור

```bash
cd frontend
npm run build
```

## מבנה תיקיות

```text
src/
  components/   - רכיבי UI משותפים
  contexts/     - state גלובלי
  hooks/        - hooks מותאמים
  pages/        - דפים ראשיים
  services/     - שירותי API
  styles.css    - סגנונות כלליים
```

## הערות

- הלקוח עובד רק עם נתיבים יחסיים
- אין חשיפה של נתיבי מערכת אמיתיים ללקוח
- עבור עריכת קבצים, יש להשתמש בקבצי טקסט רגילים
