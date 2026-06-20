import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';

interface InfoRowProps {
  label: string;
  value: string;
  highlight?: boolean;
  error?: boolean;
}

const InfoRow: React.FC<InfoRowProps> = ({ label, value, highlight, error }) => {
  return (
    <View className={styles.infoRow}>
      <Text className={styles.label}>{label}</Text>
      <Text className={classnames(styles.value, highlight && styles.highlight, error && styles.error)}>
        {value}
      </Text>
    </View>
  );
};

export default InfoRow;
