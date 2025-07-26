import React from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import { COSMIC_THEME } from '../../constants/theme';

const SettingsScreen: React.FC = () => {
  const [notifications, setNotifications] = React.useState(true);
  const [backgroundRecording, setBackgroundRecording] = React.useState(true);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        <View style={styles.setting}>
          <Text style={styles.settingLabel}>Enable Notifications</Text>
          <Switch
            value={notifications}
            onValueChange={setNotifications}
            trackColor={{ false: COSMIC_THEME.colors.surface, true: COSMIC_THEME.colors.accent }}
            thumbColor={notifications ? COSMIC_THEME.colors.text : COSMIC_THEME.colors.textSecondary}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recording</Text>
        <View style={styles.setting}>
          <Text style={styles.settingLabel}>Background Recording</Text>
          <Switch
            value={backgroundRecording}
            onValueChange={setBackgroundRecording}
            trackColor={{ false: COSMIC_THEME.colors.surface, true: COSMIC_THEME.colors.accent }}
            thumbColor={backgroundRecording ? COSMIC_THEME.colors.text : COSMIC_THEME.colors.textSecondary}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Audio Quality</Text>
        <Text style={styles.settingLabel}>High Quality</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COSMIC_THEME.colors.background,
    padding: COSMIC_THEME.spacing.lg,
  },
  title: {
    fontSize: COSMIC_THEME.typography.h1.fontSize,
    fontWeight: COSMIC_THEME.typography.h1.fontWeight,
    color: COSMIC_THEME.colors.text,
    marginBottom: COSMIC_THEME.spacing.xl,
  },
  section: {
    marginBottom: COSMIC_THEME.spacing.xl,
  },
  sectionTitle: {
    fontSize: COSMIC_THEME.typography.h2.fontSize,
    fontWeight: COSMIC_THEME.typography.h2.fontWeight,
    color: COSMIC_THEME.colors.text,
    marginBottom: COSMIC_THEME.spacing.md,
  },
  setting: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COSMIC_THEME.colors.surface,
    padding: COSMIC_THEME.spacing.md,
    borderRadius: 12,
    marginBottom: COSMIC_THEME.spacing.sm,
  },
  settingLabel: {
    fontSize: COSMIC_THEME.typography.body.fontSize,
    color: COSMIC_THEME.colors.text,
  },
});

export default SettingsScreen;