import { Tabs } from 'expo-router'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useState } from 'react'
import { C, F } from '@/lib/theme'
import SOSModal from '@/components/SOSModal'

type IoniconName = React.ComponentProps<typeof Ionicons>['name']

interface TabIconProps {
  icon: IoniconName
  iconActive: IoniconName
  label: string
  focused: boolean
}

function TabIcon({ icon, iconActive, label, focused }: TabIconProps) {
  return (
    <View style={styles.tabItem}>
      <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
        <Ionicons
          name={focused ? iconActive : icon}
          size={22}
          color={focused ? C.orange : '#3a3a3a'}
        />
      </View>
      <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>
        {label}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  tabItem:         { alignItems: 'center', gap: 4 },
  iconWrap:        { width: 44, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  iconWrapActive:  { backgroundColor: C.orange + '18' },
  tabLabel:        { fontSize: 10, fontFamily: F.bold, color: '#2a2a2a', letterSpacing: 0.3 },
  tabLabelActive:  { color: C.orange },

  sosFloat: {
    position: 'absolute',
    left: 20,
    bottom: 92,           // 72px tab bar + 20px margin
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: '#FF6B2C',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#FF6B2C',
    shadowOpacity: 0.5,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  sosIcon: { fontSize: 24 },
})

export default function TabLayout() {
  const [sosVisible, setSosVisible] = useState(false)

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: '#0a0a0a',
            borderTopColor: '#ffffff08',
            borderTopWidth: 1,
            height: 72,
            paddingBottom: 10,
            paddingTop: 6,
          },
          tabBarShowLabel: false,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{ tabBarIcon: ({ focused }: { focused: boolean }) =>
            <TabIcon icon="home-outline" iconActive="home" label="בית" focused={focused} />
          }}
        />
        <Tabs.Screen
          name="insights"
          options={{ tabBarIcon: ({ focused }: { focused: boolean }) =>
            <TabIcon icon="stats-chart-outline" iconActive="stats-chart" label="נתונים" focused={focused} />
          }}
        />
        <Tabs.Screen
          name="community"
          options={{ tabBarIcon: ({ focused }: { focused: boolean }) =>
            <TabIcon icon="people-outline" iconActive="people" label="קהילה" focused={focused} />
          }}
        />
        <Tabs.Screen
          name="coach"
          options={{ tabBarIcon: ({ focused }: { focused: boolean }) => (
            <View style={styles.tabItem}>
              <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
                <Text style={{ fontSize: 20 }}>🤖</Text>
              </View>
              <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>מאמן</Text>
            </View>
          )}}
        />
        <Tabs.Screen
          name="resources"
          options={{ tabBarIcon: ({ focused }: { focused: boolean }) =>
            <TabIcon icon="book-outline" iconActive="book" label="תוכן" focused={focused} />
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{ tabBarIcon: ({ focused }: { focused: boolean }) =>
            <TabIcon icon="person-outline" iconActive="person" label="פרופיל" focused={focused} />
          }}
        />
      </Tabs>

      {/* Global SOS floating button */}
      <TouchableOpacity
        style={styles.sosFloat}
        onPress={() => setSosVisible(true)}
        activeOpacity={0.85}
      >
        <Text style={styles.sosIcon}>⚡</Text>
      </TouchableOpacity>

      <SOSModal visible={sosVisible} onClose={() => setSosVisible(false)} />
    </View>
  )
}
