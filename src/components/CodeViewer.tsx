import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Clipboard } from 'react-native';
import { getColors, AppTheme } from '../styles/theme';


import { Ionicons } from '@expo/vector-icons';

interface CodeViewerProps {
  code: string;
  language: string;
  maxLines?: number;
  theme?: AppTheme;
}

export const CodeViewer: React.FC<CodeViewerProps> = ({ code, language, maxLines, theme = 'dark' }) => {
  const [copied, setCopied] = useState(false);
  const colors = getColors(theme);
  const styles = getStyles(theme);

  const lines = code.trim().split('\n');
  const visibleLines = maxLines ? lines.slice(0, maxLines) : lines;
  const hasMoreLines = maxLines && lines.length > maxLines;

  const handleCopy = () => {
    Clipboard.setString(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderHighlightedLine = (line: string, index: number) => {
    if (!line.trim()) {
      return <Text key={index} style={styles.codeText}> </Text>;
    }

    const words = line.split(/(\s+|\b)/);
    const keywords = new Set([
      'const', 'let', 'var', 'function', 'return', 'import', 'export', 'default', 'from',
      'class', 'extends', 'if', 'else', 'for', 'while', 'switch', 'case', 'break', 'new',
      'def', 'async', 'await', 'try', 'catch', 'throw', 'public', 'private', 'static',
      'interface', 'type', 'as', 'any', 'void', 'string', 'number', 'boolean'
    ]);

    const controlKeywords = new Set(['if', 'else', 'return', 'try', 'catch', 'throw', 'break', 'case']);

    return (
      <Text key={index} style={styles.codeText} numberOfLines={1}>
        {words.map((word, wIdx) => {
          const trimmed = word.trim();
          
          if (line.trim().startsWith('//') || line.trim().startsWith('#') || line.trim().startsWith('/*')) {
            return (
              <Text key={wIdx} style={styles.comment}>
                {word}
              </Text>
            );
          }

          if ((word.startsWith("'") && word.endsWith("'")) || 
              (word.startsWith('"') && word.endsWith('"')) ||
              (word.startsWith('`') && word.endsWith('`'))) {
            return (
              <Text key={wIdx} style={styles.string}>
                {word}
              </Text>
            );
          }

          if (keywords.has(trimmed)) {
            const style = controlKeywords.has(trimmed) ? styles.keywordControl : styles.keywordType;
            return (
              <Text key={wIdx} style={style}>
                {word}
              </Text>
            );
          }

          if (/^\d+$/.test(trimmed)) {
            return (
              <Text key={wIdx} style={styles.number}>
                {word}
              </Text>
            );
          }

          if (trimmed && words[wIdx + 1] === '(') {
            return (
              <Text key={wIdx} style={styles.function}>
                {word}
              </Text>
            );
          }

          return <Text key={wIdx} style={styles.plainText}>{word}</Text>;
        })}
      </Text>
    );
  };

  return (
    <View style={styles.container}>
      {}
      <View style={styles.header}>
        {}
        <View style={styles.dotsRow}>
          <View style={[styles.dot, styles.dotRed]} />
          <View style={[styles.dot, styles.dotYellow]} />
          <View style={[styles.dot, styles.dotGreen]} />
          
          {}
          <View style={styles.fileTitleRow}>
            <Ionicons name="terminal-outline" size={12} color={colors.primaryLight} style={{ marginRight: 4 }} />
            <Text style={styles.languageText}>{language.toLowerCase()}</Text>
          </View>
        </View>

        <Pressable 
          style={({ pressed }) => [styles.copyButton, { opacity: pressed ? 0.7 : 1 }]} 
          onPress={handleCopy}
        >
          {copied ? (
            <View style={styles.row}>
              <Ionicons name="checkmark" size={12} color={colors.secondary} />
              <Text style={[styles.copyText, { color: colors.secondary }]}>Copied</Text>
            </View>
          ) : (
            <View style={styles.row}>
              <Ionicons name="copy-outline" size={12} color={colors.textSecondary} />
              <Text style={styles.copyText}>Copy</Text>
            </View>
          )}
        </Pressable>
      </View>

      <ScrollView horizontal contentContainerStyle={{ minWidth: '100%' }} showsHorizontalScrollIndicator={true}>
        <View style={styles.editorArea}>
          <View style={styles.lineNumbersColumn}>
            {visibleLines.map((_, i) => (
              <Text key={i} style={styles.lineNumberText}>
                {i + 1}
              </Text>
            ))}
            {hasMoreLines && <Text style={styles.lineNumberText}>...</Text>}
          </View>

          <View style={styles.codeColumn}>
            {visibleLines.map((line, i) => renderHighlightedLine(line, i))}
            {hasMoreLines && (
              <Text style={[styles.codeText, styles.comment]}>
                {`// ... and ${lines.length - maxLines} more lines`}
              </Text>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const getStyles = (theme: AppTheme) => {
  const colors = getColors(theme);
  
  return StyleSheet.create({
    container: {
      backgroundColor: colors.codeBg,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: 'hidden',
      marginVertical: 8,
      shadowColor: theme === 'dark' ? '#000' : 'rgba(0,0,0,0.03)',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 2,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: theme === 'dark' ? '#070A10' : '#E2E8F0',
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderColor: colors.border,
    },
    dotsRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginRight: 5,
    },
    dotRed: {
      backgroundColor: '#EF4444',
    },
    dotYellow: {
      backgroundColor: '#F59E0B',
    },
    dotGreen: {
      backgroundColor: '#10B981',
    },
    fileTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginLeft: 10,
    },
    languageText: {
      color: colors.textSecondary,
      fontSize: 10,
      fontFamily: 'monospace',
      fontWeight: 'bold',
    },
    copyButton: {
      padding: 4,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    copyText: {
      color: colors.textSecondary,
      fontSize: 11,
      marginLeft: 4,
      fontWeight: '600',
    },
    editorArea: {
      flexDirection: 'row',
      paddingVertical: 14,
    },
    lineNumbersColumn: {
      width: 34,
      alignItems: 'flex-end',
      paddingRight: 12,
      borderRightWidth: 1,
      borderRightColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
    },
    lineNumberText: {
      fontFamily: 'monospace',
      fontSize: 11,
      color: colors.textMuted,
      lineHeight: 18,
    },
    codeColumn: {
      paddingLeft: 12,
      paddingRight: 24,
    },
    codeText: {
      fontFamily: 'monospace',
      fontSize: 11.5,
      lineHeight: 18,
    },
    plainText: {
      color: colors.text,
    },
    keywordType: {
      color: '#60A5FA', 
      fontWeight: 'bold',
    },
    keywordControl: {
      color: '#F472B6', 
      fontWeight: 'bold',
    },
    function: {
      color: theme === 'dark' ? '#F59E0B' : '#B45309', 
    },
    string: {
      color: theme === 'dark' ? '#34D399' : '#047857', 
    },
    number: {
      color: '#EC4899', 
    },
    comment: {
      color: colors.textMuted,
      fontStyle: 'italic',
    },
  });
};
