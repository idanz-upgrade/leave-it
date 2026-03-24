import { Tabs } from 'expo-router'
import { View, Text, StyleSheet } from 'react-native'
import { C, F } from '@/lib/theme'

function TabIcon({ emoji, label, focused }: { emoji: string; label: string; focused: boolean }) {
  return (
    <View style={styles.tabItem}>
      <Text style={styles.tabEmoji}>{emoji}</Text>
      <Text style={[styles.tabLabel, { color: focused ? C.orange : C.dim }]}>{label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  tabItem: { alignItems: 'center', gap: 2 },
  tabEmoji: { fontSize: 20 },
  tabLabel: { fontSize: 10, fontFamily: F.bold },
})

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#111',
          borderTopColor: C.border,
          borderTopWidth: 1,
          height: 70,
          paddingBottom: 10,
        },
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="🏕️" label="בית" focused={focused} /> }}
      />
      <Tabs.Screen
        name="insights"
        options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="📊" label="תובנות" focused={focused} /> }}
      />
      <Tabs.Screen
        name="community"
        options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="👥" label="קהילה" focused={focused} /> }}
      />
      <Tabs.Screen
        name="resources"
        options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="📖" label="משאבים" focused={focused} /> }}
      />
      <Tabs.Screen
        name="profile"
        options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="👤" label="פרופיל" focused={focused} /> }}
      />
    </Tabs>
  )
}
