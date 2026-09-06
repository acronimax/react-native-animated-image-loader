import * as React from 'react';
import { Link } from 'expo-router';
import { FlatList, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PLACEHOLDER_EXAMPLES } from '../../src/demoData';

/** Menu of every placeholder mode + customization example, each on its own screen. */
export default function ExamplesScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={PLACEHOLDER_EXAMPLES}
        keyExtractor={(item) => item.slug}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Link href={`/placeholder/${item.slug}`} asChild>
            <TouchableOpacity style={styles.row}>
              <Text style={styles.rowTitle}>{item.title}</Text>
              <Text style={styles.rowDescription}>{item.description}</Text>
            </TouchableOpacity>
          </Link>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    padding: 16,
  },
  row: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: 'rgba(120,120,128,0.12)',
    marginBottom: 10,
  },
  rowTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  rowDescription: {
    marginTop: 4,
    fontSize: 13,
    opacity: 0.7,
  },
});
