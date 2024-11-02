import { Stack } from 'expo-router';
import React from 'react';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen
        name="weather"
        options={{
          headerShown:false
        }}
      />
    </Stack>
  );
}
