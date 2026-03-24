'use client'

import { useState } from 'react'
import { Flame, Trophy, Users } from 'lucide-react'
import { useStore } from '@/lib/store'

const MOCK_LEADERBOARD = [
  { rank: 1, name: 'לוחם_א', streak: 147 },
  { rank: 2, name: 'נצחון', streak: 120 },
  { rank: 3, name: 'חזק_יותר', streak: 98 },
  { rank: 4, name: 'משתמש_777', streak: 84 },
  { rank: 5, name: 'אנונימי', streak: 73 },
]

const STREAK_GOALS = [
  { days: 7, count: 342, label: '7 ימים' },
  { days: 30, count: 187, label: '30 יום' },
  { days: 90, count: 64, label: '90 יום' },
  { days: 365, count: 12, label: 'שנה' },
]

const TABS = ['לידרבורד', 'חברים', 'פעילות']

export default function CommunityTab() {
  const { currentStreak } = useStore()
  const [activeTab, setActiveTab] = useState(0)

  return (
    <div style={{ padding: '0 0 100px' }}>
      <div style={{
        padding: '16px 20px',
        paddingTop: 'max(16px, env(safe-area-inset-top))',
      }}>
        <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 800, color: '#f5f5f5', fontFamily: 'Rubik, sans-serif', textAlign: 'right' }}>
          קהילה
        </h1>
      </div>

      {/* Sub-tabs */}
      <div style={{ display: 'flex', padding: '0 16px 16px', gap: '8px' }}>
        {TABS.map((tab, i) => (
          <button
            key={tab}
            onClick={() => setActiveTab(i)}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: '10px',
              border: `1px solid ${activeTab === i ? '#f97316' : '#2a2a2a'}`,
              background: activeTab === i ? 'rgba(249,115,22,0.15)' : '#1a1a1a',
              color: activeTab === i ? '#f97316' : '#6b7280',
              fontSize: '13px',
              fontWeight: activeTab === i ? 700 : 400,
              fontFamily: 'Rubik, sans-serif',
              cursor: 'pointer',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {activeTab === 0 && (
          <>
            {/* My position */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(249,115,22,0.15), rgba(249,115,22,0.05))',
              borderRadius: '14px',
              border: '1px solid rgba(249,115,22,0.3)',
              padding: '16px',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '12px', color: '#a3a3a3', marginBottom: '8px', fontFamily: 'Rubik, sans-serif' }}>
                המיקום שלי מתוך 1,237 לוחמים
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '28px', fontWeight: 900, color: '#f97316', fontFamily: 'Rubik, sans-serif' }}>
                  {currentStreak > 0 ? '#' + Math.floor(Math.random() * 500 + 100) : 'בתחתית'}
                </span>
                <Flame size={20} color="#f97316" />
                <span style={{ fontSize: '20px', fontWeight: 700, color: '#f5f5f5', fontFamily: 'Rubik, sans-serif' }}>
                  {currentStreak}
                </span>
              </div>
            </div>

            {/* Leaderboard */}
            <div style={{ background: '#1a1a1a', borderRadius: '14px', border: '1px solid #2a2a2a', padding: '16px' }}>
              <h3 style={{ margin: '0 0 16px', fontSize: '14px', fontWeight: 700, color: '#a3a3a3', fontFamily: 'Rubik, sans-serif', textAlign: 'right', letterSpacing: '1px' }}>
                TOP STREAKS
              </h3>
              {MOCK_LEADERBOARD.map(u => (
                <div key={u.rank} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 0',
                  borderBottom: '1px solid #1f1f1f',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Flame size={16} color="#f97316" />
                    <span style={{ fontSize: '15px', fontWeight: 700, color: '#f97316', fontFamily: 'Rubik, sans-serif' }}>
                      {u.streak}
                    </span>
                    <span style={{ fontSize: '12px', color: '#6b7280', fontFamily: 'Rubik, sans-serif' }}>ימים</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '14px', color: '#f5f5f5', fontFamily: 'Rubik, sans-serif' }}>{u.name}</span>
                    <span style={{ fontSize: '16px', fontWeight: 700, color: u.rank <= 3 ? '#eab308' : '#6b7280', width: '24px', textAlign: 'left' }}>
                      #{u.rank}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Streak goals */}
            <div style={{ background: '#1a1a1a', borderRadius: '14px', border: '1px solid #2a2a2a', padding: '16px' }}>
              <h3 style={{ margin: '0 0 16px', fontSize: '14px', fontWeight: 700, color: '#a3a3a3', fontFamily: 'Rubik, sans-serif', textAlign: 'right' }}>
                יעדים משותפים
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {STREAK_GOALS.map(g => (
                  <div key={g.days} style={{
                    background: '#111',
                    borderRadius: '10px',
                    padding: '12px',
                    textAlign: 'center',
                    border: '1px solid #222',
                  }}>
                    <div style={{ fontSize: '18px', fontWeight: 800, color: '#f97316', fontFamily: 'Rubik, sans-serif' }}>{g.count}</div>
                    <div style={{ fontSize: '11px', color: '#6b7280', fontFamily: 'Rubik, sans-serif' }}>לוחמים</div>
                    <div style={{ fontSize: '12px', color: '#a3a3a3', marginTop: '4px', fontFamily: 'Rubik, sans-serif' }}>{g.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {activeTab === 1 && (
          <div style={{
            background: '#1a1a1a', borderRadius: '14px', border: '1px solid #2a2a2a',
            padding: '40px 24px', textAlign: 'center',
          }}>
            <Users size={48} color="#3a3a3a" style={{ marginBottom: '16px' }} />
            <p style={{ color: '#6b7280', fontSize: '15px', fontFamily: 'Rubik, sans-serif' }}>
              פיצ&#39;ר חברים בקרוב
            </p>
          </div>
        )}

        {activeTab === 2 && (
          <div style={{
            background: '#1a1a1a', borderRadius: '14px', border: '1px solid #2a2a2a',
            padding: '40px 24px', textAlign: 'center',
          }}>
            <Trophy size={48} color="#3a3a3a" style={{ marginBottom: '16px' }} />
            <p style={{ color: '#6b7280', fontSize: '15px', fontFamily: 'Rubik, sans-serif' }}>
              פיד פעילות בקרוב
            </p>
          </div>
        )}

        <div style={{ textAlign: 'center', padding: '8px' }}>
          <p style={{ color: '#3a3a3a', fontSize: '13px', fontFamily: 'Rubik, sans-serif' }}>
            {currentStreak === 0 ? 'התחל את ה-Streak כדי להצטרף ל-1,237 לוחמים' : `אתה נלחם יחד עם 1,237 לוחמים 💪`}
          </p>
        </div>
      </div>
    </div>
  )
}
