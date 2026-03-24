'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, PlayCircle, BookOpen } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const GUIDES = [
  {
    title: 'מדריך אייפון',
    icon: '📱',
    content: `1. עבור להגדרות > זמן מסך\n2. הפעל "זמן מסך" והגדר קוד סיסמה\n3. תחת "הגבלות תוכן ומידע" → "תוכן אינטרנט" → "אתרי מבוגרים"\n4. הפעל "הגבל אתרי מבוגרים"\n5. הוסף אתרים לחסימה ידנית בסעיף "לעולם אל תאפשר"\n\n💡 טיפ: בקש מחבר מהימן להגדיר את קוד הסיסמה`,
  },
  {
    title: 'מדריך Mac',
    icon: '💻',
    content: `1. עבור להגדרות מערכת > זמן מסך\n2. הפעל זמן מסך עם קוד\n3. בחר "תוכן ופרטיות" → "גישה לאינטרנט"\n4. הגבל גישה לאתרים לא מתאימים\n\n🔧 כלים נוספים:\n- Cold Turkey Blocker\n- BlockSite (תוסף Chrome/Firefox)`,
  },
]

const ARTICLES = [
  {
    title: 'המדע מאחורי ההתמכרות',
    subtitle: 'דופמין, הרגלים, והמוח שלך',
    icon: '🧠',
    readTime: '5 דקות',
    xp: 50,
    content: `דופמין הוא הנוירוטרנסמיטר שאחראי לתחושת ה"רצון". הוא לא נוצר מהצריכה עצמה, אלא מהציפייה אליה.\n\nכשצורכים תוכן מגרה בתדירות גבוהה, המוח מסתגל על ידי הפחתת רגישות הקולטנים. הדבר יוצר תחושה של "שוב לא מספיק" — שהיא ליבת ההתמכרות.\n\nהחדשות הטובות? המוח מסוגל להשתקם (Neuroplasticity). מחקרים מראים שאחרי 90 יום ההפחתה, רגישות הדופמין חוזרת לנורמה.`,
  },
  {
    title: 'למה כוח רצון לא מספיק',
    subtitle: 'הצורך להחליף הרגלים',
    icon: '⚡',
    readTime: '4 דקות',
    xp: 50,
    content: `מחקר של רוי באומייסטר הראה שכוח הרצון הוא משאב מוגבל — הוא "מתרוקן" לאורך היום.\n\nהפתרון: אל תסמוך על כוח הרצון. במקום זאת:\n1. שנה את הסביבה (מניעה > התנגדות)\n2. בנה הרגלים חלופיים שממלאים את אותו צורך\n3. צור "חסמים לחיכוך" — הפוך את ההרגל הרע לקשה יותר\n4. הפוך את ההרגל הטוב לקל יותר`,
  },
  {
    title: 'שמירת הברית בהלכה',
    subtitle: 'מקורות ועצות מהמסורת',
    icon: '✡️',
    readTime: '6 דקות',
    xp: 50,
    content: `שמירת הברית היא אחת המצוות החשובות, ועוסקת בשמירת הקדושה של הגוף והנשמה.\n\n"שמר נפשך מאוד" — שמירה על הנפש כוללת גם שמירה על המחשבות ועל מה שמכניסים לתוך הראש.\n\nעצות מעשיות:\n• "גדר עצמך" — צור גבולות פיזיים לפני שתגיע לרגע הקשה\n• "שיש לו חבר" — מציאת חבר אחראי\n• תפילה בשעת הפיתוי — "אין לי כוח אלא בך"`,
  },
]

function CollapsibleGuide({ guide }: { guide: typeof GUIDES[0] }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ background: '#1a1a1a', borderRadius: '12px', border: '1px solid #2a2a2a', overflow: 'hidden' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%', padding: '16px',
          background: 'none', border: 'none', cursor: 'pointer',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}
      >
        <div>{open ? <ChevronUp size={18} color="#6b7280" /> : <ChevronDown size={18} color="#6b7280" />}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '15px', fontWeight: 600, color: '#f5f5f5', fontFamily: 'Rubik, sans-serif' }}>
            {guide.title}
          </span>
          <span>{guide.icon}</span>
        </div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ padding: '0 16px 16px', borderTop: '1px solid #222' }}>
              <pre style={{
                color: '#a3a3a3', fontSize: '14px', fontFamily: 'Rubik, sans-serif',
                lineHeight: 1.7, whiteSpace: 'pre-wrap', margin: '12px 0 0', direction: 'rtl', textAlign: 'right',
              }}>
                {guide.content}
              </pre>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function ArticleCard({ article }: { article: typeof ARTICLES[0] }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ background: '#1a1a1a', borderRadius: '12px', border: '1px solid #2a2a2a', overflow: 'hidden' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{ width: '100%', padding: '16px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'right' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '11px', color: '#f97316', fontFamily: 'Rubik, sans-serif', fontWeight: 600 }}>+{article.xp} XP</span>
            <span style={{ fontSize: '11px', color: '#3a3a3a', fontFamily: 'Rubik, sans-serif' }}>{article.readTime}</span>
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-end', marginBottom: '4px' }}>
              <span style={{ fontSize: '16px', fontWeight: 700, color: '#f5f5f5', fontFamily: 'Rubik, sans-serif' }}>{article.title}</span>
              <span style={{ fontSize: '20px' }}>{article.icon}</span>
            </div>
            <p style={{ margin: 0, fontSize: '13px', color: '#6b7280', fontFamily: 'Rubik, sans-serif' }}>{article.subtitle}</p>
          </div>
        </div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} style={{ overflow: 'hidden' }}>
            <div style={{ padding: '0 16px 16px', borderTop: '1px solid #222' }}>
              <pre style={{
                color: '#a3a3a3', fontSize: '14px', fontFamily: 'Rubik, sans-serif',
                lineHeight: 1.8, whiteSpace: 'pre-wrap', margin: '12px 0 0', direction: 'rtl', textAlign: 'right',
              }}>
                {article.content}
              </pre>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function ResourcesTab() {
  return (
    <div style={{ padding: '0 0 100px' }}>
      <div style={{
        padding: '16px 20px',
        paddingTop: 'max(16px, env(safe-area-inset-top))',
      }}>
        <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 800, color: '#f5f5f5', fontFamily: 'Rubik, sans-serif', textAlign: 'right' }}>
          משאבים
        </h1>
      </div>

      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Guides */}
        <div>
          <h2 style={{ fontSize: '13px', fontWeight: 700, color: '#a3a3a3', fontFamily: 'Rubik, sans-serif', textAlign: 'right', letterSpacing: '1.5px', textTransform: 'uppercase', margin: '0 0 10px' }}>
            מדריכים שלב-אחר-שלב
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {GUIDES.map(g => <CollapsibleGuide key={g.title} guide={g} />)}
          </div>
        </div>

        {/* Articles */}
        <div>
          <h2 style={{ fontSize: '13px', fontWeight: 700, color: '#a3a3a3', fontFamily: 'Rubik, sans-serif', textAlign: 'right', letterSpacing: '1.5px', textTransform: 'uppercase', margin: '0 0 10px' }}>
            למד עוד
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {ARTICLES.map(a => <ArticleCard key={a.title} article={a} />)}
          </div>
        </div>

        {/* Video placeholder */}
        <div>
          <h2 style={{ fontSize: '13px', fontWeight: 700, color: '#a3a3a3', fontFamily: 'Rubik, sans-serif', textAlign: 'right', letterSpacing: '1.5px', textTransform: 'uppercase', margin: '0 0 10px' }}>
            סרטוני הדרכה
          </h2>
          {['כיצד לנעול את האייפון שלך', 'כיצד לנעול את המחשב שלך'].map(title => (
            <div key={title} style={{
              background: '#1a1a1a', borderRadius: '12px', border: '1px solid #2a2a2a',
              padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px',
            }}>
              <PlayCircle size={24} color="#f97316" />
              <div style={{ textAlign: 'right' }}>
                <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#f5f5f5', fontFamily: 'Rubik, sans-serif' }}>{title}</p>
                <p style={{ margin: 0, fontSize: '12px', color: '#6b7280', fontFamily: 'Rubik, sans-serif' }}>בקרוב</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
