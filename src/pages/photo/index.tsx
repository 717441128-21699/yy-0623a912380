import React, { useState, useMemo } from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';

interface PhotoGroup {
  key: string;
  label: string;
  icon: string;
  desc: string;
  photos: string[];
  required: number;
}

const PhotoPage: React.FC = () => {
  const [photoGroups, setPhotoGroups] = useState<PhotoGroup[]>([
    {
      key: 'plate',
      label: '车牌',
      icon: '🚚',
      desc: '拍摄运输车辆车牌号，确保可清晰识别',
      photos: [],
      required: 1
    },
    {
      key: 'nameplate',
      label: '铭牌',
      icon: '🏷️',
      desc: '拍摄材料铭牌/标识牌，显示规格、批号、生产厂家等信息',
      photos: [],
      required: 1
    },
    {
      key: 'stacking',
      label: '堆放位置',
      icon: '📍',
      desc: '拍摄材料堆放位置，能反映现场环境和堆放情况',
      photos: [],
      required: 1
    },
    {
      key: 'sampling',
      label: '抽检部位',
      icon: '🔍',
      desc: '拍摄抽检部位细节，反映材料质量状况',
      photos: [],
      required: 2
    }
  ]);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const missingCount = useMemo(() => {
    return photoGroups.reduce((count, group) => {
      if (group.photos.length < group.required) {
        return count + (group.required - group.photos.length);
      }
      return count;
    }, 0);
  }, [photoGroups]);

  const allComplete = useMemo(() => {
    return photoGroups.every(group => group.photos.length >= group.required);
  }, [photoGroups]);

  const handleAddPhoto = (groupIndex: number) => {
    Taro.chooseImage({
      count: 3,
      sizeType: ['compressed'],
      sourceType: ['camera', 'album'],
      success: (res) => {
        const newGroups = [...photoGroups];
        newGroups[groupIndex].photos = [
          ...newGroups[groupIndex].photos,
          ...res.tempFilePaths
        ];
        setPhotoGroups(newGroups);
      },
      fail: (err) => {
        console.error('[Photo] chooseImage failed', err);
      }
    });
  };

  const handleDeletePhoto = (groupIndex: number, photoIndex: number, e: any) => {
    e.stopPropagation();
    const newGroups = [...photoGroups];
    newGroups[groupIndex].photos.splice(photoIndex, 1);
    setPhotoGroups(newGroups);
  };

  const handlePreview = (url: string) => {
    setPreviewUrl(url);
  };

  const handleSubmit = () => {
    if (!allComplete) {
      Taro.showModal({
        title: '照片不完整',
        content: `还有${missingCount}张照片未拍摄，确定要提交吗？`,
        confirmText: '继续提交',
        cancelText: '返回拍摄',
        success: (res) => {
          if (res.confirm) {
            doSubmit();
          }
        }
      });
      return;
    }
    doSubmit();
  };

  const doSubmit = () => {
    Taro.showLoading({ title: '提交中...' });
    setTimeout(() => {
      Taro.hideLoading();
      Taro.showToast({
        title: '验收记录已提交',
        icon: 'success'
      });
      setTimeout(() => {
        Taro.switchTab({
          url: '/pages/records/index'
        });
      }, 1500);
    }, 1000);
  };

  const handleBack = () => {
    Taro.navigateBack();
  };

  return (
    <View className={styles.page}>
      <View className={styles.progressBar}>
        <View className={styles.step}>
          <View className={classnames(styles.stepDot, styles.done)}>✓</View>
          <Text className={styles.stepText}>到货核验</Text>
        </View>
        <View className={classnames(styles.stepLine, styles.done)} />
        <View className={styles.step}>
          <View className={classnames(styles.stepDot, styles.active)}>2</View>
          <Text className={classnames(styles.stepText, styles.active)}>拍照留痕</Text>
        </View>
        <View className={styles.stepLine} />
        <View className={styles.step}>
          <View className={styles.stepDot}>3</View>
          <Text className={styles.stepText}>完成</Text>
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionTitle}>
          <Text>现场拍照</Text>
          {missingCount > 0 && (
            <View className={styles.missingCount}>
              <Text>缺 {missingCount} 项</Text>
            </View>
          )}
        </View>
        <View className={styles.tipBox}>
          <Text className={styles.tipIcon}>💡</Text>
          <Text className={styles.tipText}>
            请按照要求逐项拍摄，确保照片清晰可辨。缺项会被系统标记，避免事后补资料。
          </Text>
        </View>

        <View className={styles.photoGrid}>
          {photoGroups.map((group, gIndex) => (
            <View
              key={group.key}
              className={classnames(
                styles.photoGroup,
                group.photos.length < group.required && styles.missing,
                group.photos.length >= group.required && styles.complete
              )}
            >
              <View className={styles.groupHeader}>
                <View className={styles.groupTitle}>
                  <Text className={styles.groupIcon}>{group.icon}</Text>
                  <Text>{group.label}</Text>
                  <Text style={{ color: '#86909C', fontSize: '24rpx', marginLeft: '8rpx' }}>
                    ({group.photos.length}/{group.required})
                  </Text>
                </View>
                <View
                  className={classnames(
                    styles.groupStatus,
                    group.photos.length < group.required ? styles.missing : styles.complete
                  )}
                >
                  <Text>{group.photos.length >= group.required ? '已完成' : '待拍摄'}</Text>
                </View>
              </View>
              <Text className={styles.groupDesc}>{group.desc}</Text>
              <View className={styles.photosRow}>
                {group.photos.map((photo, pIndex) => (
                  <View key={pIndex} className={styles.photoItem}>
                    <Image
                      className={styles.photoImg}
                      src={photo}
                      mode="aspectFill"
                      onClick={() => handlePreview(photo)}
                    />
                    <View
                      className={styles.deleteBtn}
                      onClick={(e) => handleDeletePhoto(gIndex, pIndex, e)}
                    >
                      <Text>×</Text>
                    </View>
                  </View>
                ))}
                {group.photos.length < group.required + 2 && (
                  <View className={styles.addPhoto} onClick={() => handleAddPhoto(gIndex)}>
                    <Text className={styles.addIcon}>+</Text>
                    <Text className={styles.addText}>拍照/上传</Text>
                  </View>
                )}
              </View>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.bottomBar}>
        <View className={styles.btnSecondary} onClick={handleBack}>
          <Text>返回修改</Text>
        </View>
        <View
          className={classnames(styles.btnPrimary, !allComplete && styles.disabled)}
          onClick={handleSubmit}
        >
          <Text>{allComplete ? '提交验收' : `缺${missingCount}项，仍提交`}</Text>
        </View>
      </View>

      {previewUrl && (
        <View className={styles.previewModal} onClick={() => setPreviewUrl(null)}>
          <View className={styles.closePreview} onClick={() => setPreviewUrl(null)}>
            <Text>×</Text>
          </View>
          <Image className={styles.previewImg} src={previewUrl} mode="aspectFit" />
        </View>
      )}
    </View>
  );
};

export default PhotoPage;
