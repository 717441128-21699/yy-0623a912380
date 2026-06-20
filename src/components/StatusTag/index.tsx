import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';

interface StatusTagProps {
  status: string;
  text: string;
}

const StatusTag: React.FC<StatusTagProps> = ({ status, text }) => {
  return (
    <View className={classnames(styles.statusTag, styles[status])}>
      <Text>{text}</Text>
    </View>
  );
};

export default StatusTag;
