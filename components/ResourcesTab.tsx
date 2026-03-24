import React, { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView } from 'react-native'
import { C, F } from '@/lib/theme'

const ARTICLES = [
  {
    title: 'החלפה, לא התנגדות',
    desc: 'למה כוח רצון לבד לא עובד — ואיך לבנות חיים שלא מניחים לך לנפול',
    emoji: '🔄',
    readTime: '5 דק׳',
  },
  {
    title: 'המדע של ההתמכרות',
    desc: 'דופמין, הרגלים ואיך המוח שלך עובד — ולמה אפשר לשנות',
    emoji: '🧬',
    readTime: '7 דק׳',
  },
  {
    title: 'מה פורנוגרפיה עושה למוח',
    desc: 'המחקר והנתונים — מה קורה לך ביולוגית ואיך להיפטר מהתלות',
    emoji: '🧠',
    readTime: '8 דק׳',
  },
  {
    title: 'שמירת הברית — מקורות ומשמעות',
    desc: 'פילוסופיה יהודית ורוחנית על קדושה, טהרה ומסע שיפור עצמי',
    emoji: '✡️',
    readTime: '6 דק׳',
  },
]

const GUIDES = [
  {
    title: 'נעל את האייפון שלך',
    desc: 'מדריך שלב-אחר-שלב לשימוש ב-Screen Time ולחסימת תוכן',
    emoji: '📱',
    tag: 'iOS',
  },
  {
    title: 'נעל את המחשב שלך',
    desc: 'הגדרת פילטרים ב-macOS ו-Windows לחסימת אתרים לא רצויים',
    emoji: '💻',
    tag: 'Mac / PC',
  },
  {
    title: 'חסימה ב-Android',
    desc: 'אפליקציות ומגבלות מובנות לאנדרואיד',
    emoji: '🤖',
    tag: 'Android',
  },
]

function ArticleCard({ article }: { article: typeof ARTICLES[0] }) {
  return (
    <TouchableOpacity style={s.articleCard} activeOpacity={0.8}>
      <View style={s.articleLeft}>
        <Text style={s.articleEmoji}>{article.emoji}</Text>
        <Text style={s.articleReadTime}>{article.readTime}</Text>
      </View>
      <View style={s.articleRight}>
        <Text style={s.articleTitle}>{article.title}</Text>
        <Text style={s.articleDesc} numberOfLines={2}>{article.desc}</Text>
      </View>
    </TouchableOpacity>
  )
}

function GuideCard({ guide }: { guide: typeof GUIDES[0] }) {
  const [expanded, setExpanded] = useState(false)
  return (
    <TouchableOpacity onPress={() => setExpanded(!expanded)} style={s.guideCard} activeOpacity={0.8}>
      <View style={s.guideHeader}>
        <Text style={{ color: C.dim, fontSize: 14 }}>{expanded ? '▲' : '▼'}</Text>
        <View style={s.guideHeaderRight}>
          <View style={s.guideTag}><Text style={s.guideTagText}>{guide.tag}</Text></View>
          <View>
            <Text style={s.guideTitle}>{guide.title}</Text>
            {!expanded && <Text style={s.guideDescCollapsed}>{guide.desc}</Text>}
          </View>
          <Text style={s.guideEmoji}>{guide.emoji}</Text>
        </View>
      </View>
      {expanded && (
        <View style={s.guideBody}>
          <Text style={s.guideDesc}>{guide.desc}</Text>
          <TouchableOpacity style={s.guideBtn} activeOpacity={0.85}>
            <Text style={s.guideBtnText}>צפה במדריך</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  )
}

export default function ResourcesTab() {
  return (
    <SafeAreaView style={s.container}>
      <View style={s.topBar}>
        <Text style={s.screenTitle}>משאבים</Text>
      </View>

      <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Section: Guides */}
        <Text style={s.sectionLabel}>מדריכים טכניים</Text>
        {GUIDES.map(g => <GuideCard key={g.title} guide={g} />)}

        {/* Section: Articles */}
        <Text style={[s.sectionLabel, { marginTop: 8 }]}>קרא עוד</Text>
        {ARTICLES.map(a => <ArticleCard key={a.title} article={a} />)}

        <View style={s.aiCard}>
          <Text style={s.aiEmoji}>🤖</Text>
          <Text style={s.aiTitle}>AI Coach — בקרוב</Text>
          <Text style={s.aiDesc}>עזרה אישית ברגעי משבר, ניתוח טריגרים, ותמיכה מותאמת אישית</Text>
          <View style={s.aiProTag}><Text style={s.aiProText}>PRO</Text></View>
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  topBar: { paddingHorizontal: 20, paddingVertical: 12 },
  screenTitle: { fontSize: 22, fontFamily: F.black, color: C.text, textAlign: 'right' },
  scrollContent: { paddingHorizontal: 16, gap: 10 },
  sectionLabel: { fontSize: 12, fontFamily: F.bold, color: C.muted, letterSpacing: 2, textAlign: 'right', marginTop: 4, marginBottom: 2 },

  articleCard: { backgroundColor: C.card, borderRadius: 14, borderWidth: 1, borderColor: C.border, padding: 16, flexDirection: 'row', gap: 14 },
  articleLeft: { alignItems: 'center', gap: 4, width: 44 },
  articleEmoji: { fontSize: 28 },
  articleReadTime: { fontSize: 10, color: C.dim, fontFamily: F.regular },
  articleRight: { flex: 1 },
  articleTitle: { fontSize: 15, fontFamily: F.bold, color: C.text, textAlign: 'right', marginBottom: 4 },
  articleDesc: { fontSize: 13, color: C.muted, fontFamily: F.regular, textAlign: 'right', lineHeight: 18 },

  guideCard: { backgroundColor: C.card, borderRadius: 14, borderWidth: 1, borderColor: C.border, padding: 16 },
  guideHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  guideHeaderRight: { flex: 1, flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginRight: 10 },
  guideEmoji: { fontSize: 24, marginLeft: 4 },
  guideTag: { backgroundColor: C.orangeDim, borderRadius: 6, paddingVertical: 3, paddingHorizontal: 8 },
  guideTagText: { fontSize: 10, color: C.orange, fontFamily: F.bold },
  guideTitle: { fontSize: 15, fontFamily: F.bold, color: C.text, textAlign: 'right', flex: 1 },
  guideDescCollapsed: { fontSize: 12, color: C.dim, fontFamily: F.regular, textAlign: 'right', marginTop: 2 },
  guideBody: { marginTop: 12, borderTopWidth: 1, borderTopColor: C.border, paddingTop: 12 },
  guideDesc: { fontSize: 14, color: C.muted, fontFamily: F.regular, textAlign: 'right', lineHeight: 20, marginBottom: 14 },
  guideBtn: { backgroundColor: C.orange, borderRadius: 10, padding: 12, alignItems: 'center' },
  guideBtnText: { color: '#fff', fontSize: 14, fontFamily: F.bold },

  aiCard: { backgroundColor: C.card, borderRadius: 14, borderWidth: 1, borderColor: C.orange, padding: 24, alignItems: 'center', gap: 8, marginTop: 8 },
  aiEmoji: { fontSize: 36 },
  aiTitle: { fontSize: 18, fontFamily: F.bold, color: C.text },
  aiDesc: { fontSize: 13, color: C.muted, fontFamily: F.regular, textAlign: 'center', lineHeight: 20 },
  aiProTag: { backgroundColor: C.orange, borderRadius: 99, paddingVertical: 4, paddingHorizontal: 14, marginTop: 4 },
  aiProText: { fontSize: 12, fontFamily: F.black, color: '#fff', letterSpacing: 1 },
})
