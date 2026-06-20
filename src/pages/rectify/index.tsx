import React, { useState, useMemo } from 'react';
import { View, Text, Image, Textarea } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import StatusTag from '@/components/StatusTag';
import { mockRectifyItems, mockInspectionRecords } from '@/data/mock';

const RectifyPage: React.FC = () => {
  const [replyText, setReplyText] = useState('');
  const [uploadPhotos, setUploadPhotos] = useState<string[]>([]);

  const rectifyItem = useMemo(() => {
    return mockRectifyItems[0] || null;
  }, []);

  const relatedInspection = useMemo(() => {
    if (!rectifyItem) return null;
    return mockInspectionRecords.find(r => r.id === rectifyItem.inspectionId) || null;
  }, [rectifyItem]);

  const timeline = useMemo(() => {
    if (!rectifyItem) return [];
    const items: any[] = [
      {
        type: 'warning',
        title: '提交整改通知',
        time: rectifyItem.submitTime,
        desc: rectifyItem.description,
        photos: rectifyItem.photos
      }
    ];
    if (rectifyItem.reply) {
      items.push({
        type: 'active',
        title: '材料员已回复',
        time: rectifyItem.replyTime,
        desc: rectifyItem.reply,
        photos: []
      });
    }
    if (rectifyItem.status === 'done') {
      items.push({
        type: 'success',
        title: '监理确认通过',
        time: rectifyItem.replyTime,
        desc: '整改合格，同意验收',
        photos: []
      });
    }
    return items;
  }, [rectifyItem]);

  const handleUpload = () => {
    Taro.chooseImage({
      count: 3,
      sizeType: ['compressed'],
      sourceType: ['camera', 'album'],
      success: (res) => {
        setUploadPhotos(prev => [...prev, ...res.tempFilePaths]);
      }
    });
  };

  const handleConfirm = () => {
    Taro.showModal({
      title: '确认整改完成',
      content: '确认该整改事项已完成，材料符合要求？',
      success: (res) => {
        if (res.confirm) {
          Taro.showToast({
            title: '已确认整改通过',
            icon: 'success'
          });
          setTimeout(() => {
            Taro.navigateBack();
          }, 1500);
        }
      }
    });
  };

  const handleReject = () => {
    if (!replyText.trim()) {
      Taro.showToast({
        title: '请填写驳回原因',
        icon: 'none'
      });
      return;
    }
    Taro.showToast({
      title: '已发送补充整改要求',
      icon: 'none'
    });
    setTimeout(() => {
      Taro.navigateBack();
    }, 1500);
  };

  const handleViewInspection = () => {
    if (rectifyItem) {
      Taro.navigateTo({
        url: `/pages/detail/index?id=${rectifyItem.inspectionId}`
      });
    }
  };

  if (!rectifyItem) {
    return (
      <View className={styles.page}>
        <Text>加载中...</Text>
      </View>
    );
  }

  const isSupervisorView = true; // 模拟监理视角

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <Text className={styles.title}>{rectifyItem.title}</Text>
        <View className={styles.statusRow}>
          <StatusTag
            status={rectifyItem.status}
            text={
              rectifyItem.status === 'pending' ? '待处理' :
              rectifyItem.status === 'processing' ? '处理中' : '已完成'
            }
          />
          <Text style={{ marginLeft: '16rpx', fontSize: '24rpx', opacity: 0.9 }}>
            截止日期：{rectifyItem.deadline}
          </Text>
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionTitle}>
          <Text className={styles.sectionIcon}>📋</Text>
          <Text>整改详情</Text>
        </View>
        <View className={styles.infoRow}>
          <Text className={styles.infoLabel}>提交人</Text>
          <Text className={styles.infoValue}>{rectifyItem.submitter}</Text>
        </View>
        <View className={styles.infoRow}>
          <Text className={styles.infoLabel}>提交时间</Text>
          <Text className={styles.infoValue}>{rectifyItem.submitTime}</Text>
        </View>
        <View className={styles.infoRow}>
          <Text className={styles.infoLabel}>问题描述</Text>
        </View>
        <View className={styles.descBox}>
          <Text>{rectifyItem.description}</Text>
        </View>
        {rectifyItem.photos.length > 0 && (
          <View className={styles.photoGrid}>
            {rectifyItem.photos.map((photo, idx) => (
              <View key={idx} className={styles.photoItem}>
                <Image className={styles.photoImg} src={photo} mode="aspectFill" />
              </View>
            ))}
          </View>
        )}
      </View>

      <View className={styles.section}>
        <View className={styles.sectionTitle}>
          <Text className={styles.sectionIcon}>📦</Text>
          <Text>关联验收单</Text>
        </View>
        {relatedInspection && (
          <View className={styles.relatedCard} onClick={handleViewInspection}>
            <View className={styles.relatedIcon}>
              <Text>📋</Text>
            </View>
            <View className={styles.relatedInfo}>
              <Text className={styles.relatedTitle}>{relatedInspection.materialName}</Text>
              <Text className={styles.relatedDesc}>
                {relatedInspection.projectName} · {relatedInspection.buildingName}
              </Text>
            </View>
            <Text className={styles.relatedArrow}>{'>'}</Text>
          </View>
        )}
      </View>

      <View className={styles.section}>
        <View className={styles.sectionTitle}>
          <Text className={styles.sectionIcon}>⏱️</Text>
          <Text>整改进度</Text>
        </View>
        <View className={styles.timeline}>
          {timeline.map((item, idx) => (
            <View key={idx} className={styles.timelineItem}>
              <View className={`${styles.timelineDot} ${styles[item.type]}`} />
              <View className={styles.timelineContent}>
                <Text className={styles.timelineTitle}>{item.title}</Text>
                <Text className={styles.timelineTime}>{item.time}</Text>
                <Text className={styles.timelineDesc}>{item.desc}</Text>
                {item.photos && item.photos.length > 0 && (
                  <View className={styles.photoGrid}>
                    {item.photos.map((photo: string, pIdx: number) => (
                      <View key={pIdx} className={styles.photoItem}>
                        <Image className={styles.photoImg} src={photo} mode="aspectFill" />
                      </View>
                    ))}
                  </View>
                )}
              </View>
            </View>
          ))}
        </View>
      </View>

      {isSupervisorView && rectifyItem.status === 'processing' && (
        <View className={styles.section}>
          <View className={styles.sectionTitle}>
            <Text className={styles.sectionIcon}>✅</Text>
            <Text>监理确认</Text>
          </View>
          <View className={styles.replySection}>
            <Text className={styles.replyLabel}>材料员回复</Text>
            <Text className={styles.replyContent}>{rectifyItem.reply}</Text>
            <Text className={styles.replyTime}>回复时间：{rectifyItem.replyTime}</Text>
          </View>
          <View className={styles.inputSection}>
            <Textarea
              className={styles.textarea}
              placeholder='如有异议可填写补充要求，无异议可直接确认通过'
              value={replyText}
              onInput={e => setReplyText(e.detail.value)}
            />
          </View>
        </View>
      )}

      {!isSupervisorView && rectifyItem.status === 'pending' && (
        <View className={styles.section}>
          <View className={styles.sectionTitle}>
            <Text className={styles.sectionIcon}>📝</Text>
            <Text>提交整改回复</Text>
          </View>
          <Textarea
            className={styles.textarea}
            placeholder='请填写整改情况说明...'
            value={replyText}
            onInput={e => setReplyText(e.detail.value)}
          />
          <View className={styles.uploadRow}>
            {uploadPhotos.map((photo, idx) => (
              <View key={idx} className={styles.photoItem}>
                <Image className={styles.photoImg} src={photo} mode="aspectFill" />
              </View>
            ))}
            <View className={styles.uploadBtn} onClick={handleUpload}>
              <Text className={styles.uploadIcon}>+</Text>
              <Text>上传照片</Text>
            </View>
          </View>
        </View>
      )}

      {rectifyItem.status !== 'done' && (
        <View className={styles.bottomBar}>
          {isSupervisorView && rectifyItem.status === 'processing' ? (
            <>
              <View className={styles.btnSecondary} onClick={handleReject}>
                <Text>要求补充</Text>
              </View>
              <View className={styles.btnPrimary} onClick={handleConfirm}>
                <Text>确认整改通过</Text>
              </View>
            </>
          ) : !isSupervisorView && rectifyItem.status === 'pending' ? (
            <View className={styles.btnWarning}>
              <Text>提交整改回复</Text>
            </View>
          ) : (
            <View className={styles.btnPrimary}>
              <Text>前往处理</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

export default RectifyPage;
