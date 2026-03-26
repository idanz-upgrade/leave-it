import { Tabs } from 'expo-router'
import { View, Text, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { C, F } from '@/lib/theme'

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
})

export default function TabLayout() {
  return (
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
          <TabIcon icon="stats-chart-outline" iconActive="stats-chart" label="תובנות" focused={focused} />
        }}
      />
      <Tabs.Screen
        name="community"
        options={{ tabBarIcon: ({ focused }: { focused: boolean }) =>
          <TabIcon icon="people-outline" iconActive="people" label="קהילה" focused={focused} />
        }}
      />
      <Tabs.Screen
        name="resources"
        options={{ tabBarIcon: ({ focused }: { focused: boolean }) =>
          <TabIcon icon="book-outline" iconActive="book" label="משאבים" focused={focused} />
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{ tabBarIcon: ({ focused }: { focused: boolean }) =>
          <TabIcon icon="person-outline" iconActive="person" label="פרופיל" focused={focused} />
        }}
      />
    </Tabs>
  )
}
