import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import * as React from 'react';

type TabIconProps = { color: string; size: number };

const renderHomeIcon = ({ color, size }: TabIconProps) => (
  <Ionicons name="home" color={color} size={size} />
);
const renderExamplesIcon = ({ color, size }: TabIconProps) => (
  <Ionicons name="grid" color={color} size={size} />
);
const renderDebugIcon = ({ color, size }: TabIconProps) => (
  <Ionicons name="bug" color={color} size={size} />
);

const renderBenchIcon = ({ color, size }: TabIconProps) => (
  <Ionicons name="speedometer" color={color} size={size} />
);

export default function TabLayout() {
  return (
    <Tabs
      initialRouteName={
        process.env.EXPO_PUBLIC_BENCH_AUTORUN === '1' ? 'benchmark' : undefined
      }
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Home', tabBarIcon: renderHomeIcon }}
      />
      <Tabs.Screen
        name="examples"
        options={{ title: 'Examples', tabBarIcon: renderExamplesIcon }}
      />
      <Tabs.Screen
        name="benchmark"
        options={{ title: 'Bench', tabBarIcon: renderBenchIcon }}
      />
      <Tabs.Screen
        name="debug"
        options={{ title: 'Debug', tabBarIcon: renderDebugIcon }}
      />
    </Tabs>
  );
}
