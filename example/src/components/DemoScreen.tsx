import * as React from 'react';
import { StyleSheet, Text, View, type ViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type DemoScreenProps = {
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  contentStyle?: ViewProps['style'];
};

/** Shared layout for every example screen: title, description, centered demo content. */
export default function DemoScreen({
  title,
  description,
  children,
  footer,
  contentStyle,
}: DemoScreenProps) {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {description ? (
        <Text style={styles.description}>{description}</Text>
      ) : null}
      <View style={[styles.content, contentStyle]}>{children}</View>
      {footer ? <View style={styles.footer}>{footer}</View> : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 24,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  description: {
    marginTop: 8,
    marginBottom: 20,
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.7,
  },
  content: {
    // 'stretch' gives percentage-width children (e.g. the loader) a
    // definite width to resolve against.
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    marginTop: 16,
    alignItems: 'center',
  },
});
