import React from 'react';
import { View, Image, Text } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';

interface PhotoItemProps {
  url?: string;
  label: string;
  uploaded: boolean;
  missing?: boolean;
  showDelete?: boolean;
  onClick?: () => void;
  onDelete?: () => void;
}

const PhotoItemComponent: React.FC<PhotoItemProps> = ({
  url,
  label,
  uploaded,
  missing,
  showDelete,
  onClick,
  onDelete
}) => {
  return (
    <View
      className={classnames(
        styles.photoItem,
        uploaded && styles.uploaded,
        missing && styles.missing
      )}
      onClick={onClick}
    >
      {uploaded && url ? (
        <Image
          className={styles.image}
          src={url}
          mode="aspectFill"
        />
      ) : (
        <View className={classnames(styles.placeholder, missing && styles.missingLabel)}>
          <Text className={styles.plusIcon}>+</Text>
          <Text>{missing ? '缺项' : '上传'}</Text>
        </View>
      )}
      <View className={styles.label}>{label}</View>
      {showDelete && uploaded && (
        <View
          className={styles.deleteBtn}
          onClick={(e) => {
            e.stopPropagation();
            onDelete?.();
          }}
        >
          ×
        </View>
      )}
    </View>
  );
};

export default PhotoItemComponent;
