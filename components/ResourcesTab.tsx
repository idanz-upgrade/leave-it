import React, { useState, useEffect, useCallback } from 'react'
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView,
  Modal, StatusBar, Platform,
} from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { C, F } from '@/lib/theme'
import { useStore } from '@/lib/store'
import { ARTICLES, Article } from '@/lib/articles'

const READ_KEY = 'read_articles_v1'

// ── Guide data ────────────────────────────────────────────────────────────────
const GUIDES = [
  { title: 'נעל את האייפון שלך',    desc: 'מדריך שלב-אחר-שלב לשימוש ב-Screen Time ולחסימת תוכן', emoji: '📱', tag: 'iOS' },
  { title: 'נעל את המחשב שלך',      desc: 'הגדרת פילטרים ב-macOS ו-Windows לחסימת אתרים לא רצויים', emoji: '💻', tag: 'Mac / PC' },
  { title: 'חסימה ב-Android',       desc: 'אפליקציות ומגבלות מובנות לאנדרואיד', emoji: '🤖', tag: 'Android' },
]

// ── Article Reader Modal ───────────────────────────────────────────────────────
function ArticleReader({ article, onClose }: { article: Article; onClose: () => void }) {
  return (
    <Modal visible animationType="slide" statusBarTranslucent>
      <SafeAreaView style={r.root}>
        {/* Header */}
        <View style={r.header}>
          <TouchableOpacity onPress={onClose} style={r.backBtn} activeOpacity={0.7}>
            <Text style={r.backArrow}>→</Text>
            <Text style={r.backLabel}>חזרה</Text>
          </TouchableOpacity>
          <Text style={r.headerTag}>{article.tag}</Text>
        </View>

        <ScrollView
          contentContainerStyle={r.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Title block */}
          <View style={r.titleBlock}>
            <Text style={r.titleEmoji}>{article.emoji}</Text>
            <Text style={r.title}>{article.title}</Text>
            <View style={r.tagPill}>
              <Text style={r.tagPillText}>{article.tag}</Text>
            </View>
          </View>

          {/* Body */}
          {article.sections.map((section, idx) => {
            if (section.type === 'paragraph') {
              return (
                <Text key={idx} style={r.paragraph}>
                  {section.text}
                </Text>
              )
            }
            if (section.type === 'pullquote') {
              return (
                <View key={idx} style={r.pullquote}>
                  <View style={r.pullquoteLine} />
                  <Text style={r.pullquoteText}>{section.text}</Text>
                </View>
              )
            }
            if (section.type === 'heading') {
              return (
                <Text key={idx} style={r.heading}>
                  {section.text}
                </Text>
              )
            }
            if (section.type === 'divider') {
              return <View key={idx} style={r.divider} />
            }
            return null
          })}

          <View style={{ height: 60 }} />
        </ScrollView>
      </SafeAreaView>
    </Modal>
  )
}

// ── Article Card ──────────────────────────────────────────────────────────────
function ArticleCard({
  article, isRead, onPress,
}: {
  article: Article; isRead: boolean; onPress: () => void
}) {
  return (
    <TouchableOpacity onPress={onPress} style={s.articleCard} activeOpacity={0.8}>
      <View style={s.articleContent}>
        <View style={s.articleMeta}>
          <Text style={s.articleEmoji}>{article.emoji}</Text>
          <View style={s.tagPill}>
            <Text style={s.tagText}>{article.tag}</Text>
          </View>
          {isRead && <View style={s.readDot} />}
        </View>
        <Text style={s.articleTitle}>{article.title}</Text>
      </View>
      <Text style={s.arrow}>‹</Text>
    </TouchableOpacity>
  )
}

// ── Guide Card ────────────────────────────────────────────────────────────────
function GuideCard({ guide }: { guide: typeof GUIDES[0] }) {
  const [expanded, setExpanded] = useState(false)
  return (
    <TouchableOpacity onPress={() => setExpanded(!expanded)} style={s.guideCard} activeOpacity={0.8}>
      <View style={s.guideHeader}>
        <Text style={{ color: C.dim, fontSize: 14 }}>{expanded ? '▲' : '▼'}</Text>
        <View style={s.guideHeaderRight}>
          <View style={s.guideTag}><Text style={s.guideTagText}>{guide.tag}</Text></View>
          <View style={{ flex: 1 }}>
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

// ── Main Component ────────────────────────────────────────────────────────────
export default function ResourcesTab() {
  const { onboardingData } = useStore()
  const isReligious = onboardingData?.languageStyle === 'religious'

  const [openArticle, setOpenArticle] = useState<Article | null>(null)
  const [readIds, setReadIds] = useState<Set<string>>(new Set())

  // Load read state from AsyncStorage
  useEffect(() => {
    AsyncStorage.getItem(READ_KEY).then(v => {
      if (v) setReadIds(new Set(JSON.parse(v) as string[]))
    }).catch(() => {})
  }, [])

  const handleOpen = useCallback(async (article: Article) => {
    setOpenArticle(article)
    if (!readIds.has(article.id)) {
      const next = new Set([...readIds, article.id])
      setReadIds(next)
      await AsyncStorage.setItem(READ_KEY, JSON.stringify([...next])).catch(() => {})
    }
  }, [readIds])

  const handleClose = useCallback(() => setOpenArticle(null), [])

  // Filter articles: hide article-3 for non-religious users
  const visibleArticles = ARTICLES.filter(a => !a.religiousOnly || isReligious)

  return (
    <SafeAreaView style={s.container}>
      <View style={s.topBar}>
        <Text style={s.screenTitle}>תוכן</Text>
      </View>

      <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Section: Guides */}
        <Text style={s.sectionLabel}>מדריכים טכניים</Text>
        {GUIDES.map(g => <GuideCard key={g.title} guide={g} />)}

        {/* Section: Articles */}
        <Text style={[s.sectionLabel, { marginTop: 8 }]}>מאמרים</Text>
        {visibleArticles.map(a => (
          <ArticleCard
            key={a.id}
            article={a}
            isRead={readIds.has(a.id)}
            onPress={() => handleOpen(a)}
          />
        ))}

        {/* AI Card */}
        <View style={s.aiCard}>
          <Text style={s.aiEmoji}>🤖</Text>
          <Text style={s.aiTitle}>AI Coach — בקרוב</Text>
          <Text style={s.aiDesc}>עזרה אישית ברגעי משבר, ניתוח טריגרים, ותמיכה מותאמת אישית</Text>
          <View style={s.aiProTag}><Text style={s.aiProText}>PRO</Text></View>
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>

      {/* Article Reader Modal */}
      {openArticle && (
        <ArticleReader article={openArticle} onClose={handleClose} />
      )}
    </SafeAreaView>
  )
}

// ── List screen styles ────────────────────────────────────────────────────────
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  topBar: { paddingHorizontal: 20, paddingVertical: 12 },
  screenTitle: { fontSize: 22, fontFamily: F.black, color: C.text, textAlign: 'right' },
  scrollContent: { paddingHorizontal: 16, gap: 10 },
  sectionLabel: {
    fontSize: 12, fontFamily: F.bold, color: C.muted,
    letterSpacing: 2, textAlign: 'right', marginTop: 4, marginBottom: 2,
  },

  // Article card
  articleCard: {
    backgroundColor: C.card, borderRadius: 14,
    borderWidth: 1, borderColor: C.border,
    padding: 16, flexDirection: 'row', alignItems: 'center',
  },
  articleContent: { flex: 1 },
  articleMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6, justifyContent: 'flex-end' },
  articleEmoji: { fontSize: 20 },
  tagPill: { backgroundColor: C.orangeDim, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  tagText: { fontSize: 10, color: C.orange, fontFamily: F.bold },
  readDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: C.green },
  articleTitle: { fontSize: 15, fontFamily: F.bold, color: C.text, textAlign: 'right', lineHeight: 22 },
  arrow: { fontSize: 24, color: C.dim, marginLeft: 10, transform: [{ scaleX: -1 }] },

  // Guide card (unchanged from original)
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

  // AI card
  aiCard: { backgroundColor: C.card, borderRadius: 14, borderWidth: 1, borderColor: C.orange, padding: 24, alignItems: 'center', gap: 8, marginTop: 8 },
  aiEmoji: { fontSize: 36 },
  aiTitle: { fontSize: 18, fontFamily: F.bold, color: C.text },
  aiDesc: { fontSize: 13, color: C.muted, fontFamily: F.regular, textAlign: 'center', lineHeight: 20 },
  aiProTag: { backgroundColor: C.orange, borderRadius: 99, paddingVertical: 4, paddingHorizontal: 14, marginTop: 4 },
  aiProText: { fontSize: 12, fontFamily: F.black, color: '#fff', letterSpacing: 1 },
})

// ── Reader screen styles ──────────────────────────────────────────────────────
const r = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0a0a0a' },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: '#1a1a1a',
  },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  backArrow: { fontSize: 20, color: C.orange },
  backLabel: { fontSize: 15, color: C.orange, fontFamily: F.bold },
  headerTag: { fontSize: 11, color: C.dim, fontFamily: F.regular },

  scrollContent: { paddingHorizontal: 22, paddingTop: 28 },

  titleBlock: { alignItems: 'flex-end', marginBottom: 32 },
  titleEmoji: { fontSize: 44, marginBottom: 12 },
  title: {
    fontSize: 26, fontFamily: F.black, color: C.text,
    textAlign: 'right', lineHeight: 36, marginBottom: 12,
  },
  tagPill: { backgroundColor: C.orangeDim, borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4 },
  tagPillText: { fontSize: 11, color: C.orange, fontFamily: F.bold },

  paragraph: {
    fontSize: 16, color: '#d4d4d4', fontFamily: F.regular,
    textAlign: 'right', lineHeight: 30, marginBottom: 20,
  },
  heading: {
    fontSize: 19, fontFamily: F.black, color: C.text,
    textAlign: 'right', marginTop: 8, marginBottom: 16,
  },
  pullquote: {
    flexDirection: 'row', gap: 14,
    marginVertical: 24, paddingVertical: 4,
  },
  pullquoteLine: {
    width: 3, borderRadius: 2, backgroundColor: C.orange,
    alignSelf: 'stretch',
  },
  pullquoteText: {
    flex: 1, fontSize: 17, fontFamily: F.bold, color: C.orange,
    textAlign: 'right', lineHeight: 28, fontStyle: 'italic',
  },
  divider: {
    height: 1, backgroundColor: '#1e1e1e', marginVertical: 24,
  },
})
