import React, { useState, useMemo } from 'react';
import { View, Text, Image, Textarea } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useRouter } from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import StatusTag from '@/components/StatusTag';
import { useInspection } from '@/store/inspectionContext';
import { RectifyReplyType } from '@/types';

const RectifyPage: React.FC = () => {
  const router = useRouter();
  const id = router.params.id;

  const {
    getRectifyById, getRecordById,
    updateRectifyItem, updateRecord, addRectifyReply
  } = useInspection();

  const [role, setRole] = useState<'supervisor' | 'material'>('material');
  const [replyText, setReplyText] = useState('');
  const [uploadPhotos, setUploadPhotos] = useState<string[]>([]);

  const rectifyItem = useMemo(() => {
    return getRectifyById(id || '');
  }, [id, getRectifyById]);

  const relatedInspection = useMemo(() => {
    if (!rectifyItem) return null;
    return getRecordById(rectifyItem.inspectionId);
  }, [rectifyItem, getRecordById]);

  const hasMaterialReply = useMemo(() => {
    if (!rectifyItem) return false;
    return rectifyItem.replies.some(r => r.type === 'material_reply');
  }, [rectifyItem]);

  const handleUpload = () => {
    Taro.chooseImage({
      count: 6,
      sizeType: ['compressed'],
      sourceType: ['camera', 'album'],
      success: (res) => {
        setUploadPhotos(prev => [...prev, ...res.tempFilePaths]);
      }
    });
  };

  const handleDeletePhoto = (idx: number) => {
    setUploadPhotos(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmitMaterialReply = () => {
    if (!replyText.trim() && uploadPhotos.length === 0) {
      Taro.showToast({ title: '请填写整改说明或上传照片', icon: 'none' });
      return;
    }
    if (!rectifyItem) return;
    Taro.showLoading({ title: '提交中...' });
    setTimeout(() => {
      Taro.hideLoading();
      addRectifyReply(rectifyItem.id, {
        type: 'material_reply' as RectifyReplyType,
        role: 'material',
        author: '材料员-刘师傅',
        content: replyText,
        photos: [...uploadPhotos]
      });
      updateRectifyItem(rectifyItem.id, { status: 'processing' });
      Taro.showToast({ title: '已提交整改回复', icon: 'success' });
      setReplyText('');
      setUploadPhotos([]);
    }, 600);
  };

  const handleSupervisorPass = () => {
    if (!rectifyItem) return;
    Taro.showModal({
      title: '确认整改通过',
      content: '确认该整改事项已完成，材料符合要求？',
      success: (res) => {
        if (res.confirm) {
          const passContent = replyText.trim() || '经现场复验，整改合格，资料齐全，同意验收。';
          addRectifyReply(rectifyItem.id, {
            type: 'supervisor_pass' as RectifyReplyType,
            role: 'supervisor',
            author: '张监理',
            content: passContent,
            photos: []
          });
          updateRectifyItem(rectifyItem.id, { status: 'done' });
          if (relatedInspection) {
            updateRecord(relatedInspection.id, { status: 'rectified' });
          }
          Taro.showToast({ title: '已确认整改通过', icon: 'success' });
          setReplyText('');
          setTimeout(() => Taro.navigateBack(), 1200);
        }
      }
    });
  };

  const handleSupervisorReject = () => {
    if (!replyText.trim()) {
      Taro.showToast({ title: '请填写退回原因和补充要求', icon: 'none' });
      return;
    }
    if (!rectifyItem) return;
    addRectifyReply(rectifyItem.id, {
      type: 'supervisor_reject' as RectifyReplyType,
      role: 'supervisor',
      author: '张监理',
      content: replyText,
      photos: []
    });
    updateRectifyItem(rectifyItem.id, { status: 'pending' });
    Taro.showToast({ title: '已发送补充要求', icon: 'none' });
    setReplyText('');
    setTimeout(() => Taro.navigateBack(), 1200);
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
      <View className={styles.page} style={{ padding: '64rpx 32rpx', textAlign: 'center' }}>
        <Text style={{ fontSize: '28rpx', color: '#86909C' }}>整改事项不存在</Text>
      </View>
    );
  }

  const canMaterialSubmit = role === 'material' && rectifyItem.status !== 'done';
  const canSupervisorAct = role === 'supervisor' && rectifyItem.status === 'processing' && hasMaterialReply;

  const getReplyTypeMeta = (type: RectifyReplyType) => {
    switch (type) {
      case 'material_reply':
        return { label: '材料员整改回复', color: '#FF7D00', cls: 'typeMaterial', dot: '📝' };
      case 'supervisor_pass':
        return { label: '监理确认通过', color: '#00B42A', cls: 'typePass', dot: '✅' };
      case 'supervisor_reject':
        return { label: '监理要求补充', color: '#F53F3F', cls: 'typeReject', dot: '⚠️' };
      default:
        return { label: '操作记录', color: '#86909C', cls: 'typeDefault', dot: '📌' };
    }
  };

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
        <View style={{ marginTop: '16rpx', display: 'flex', gap: '12rpx' }}>
          <View
            className={classnames({ [styles.activeRole]: role === 'material' })}
            style={{
              padding: '6rpx 20rpx',
              borderRadius: '32rpx',
              fontSize: '22rpx',
              background: role === 'material' ? '#fff' : 'rgba(255,255,255,0.2)',
              color: role === 'material' ? '#FF7D00' : '#fff'
            }}
            onClick={() => setRole('material')}
          >
            <Text>切换：材料员视角</Text>
          </View>
          <View
            className={classnames({ [styles.activeRole]: role === 'supervisor' })}
            style={{
              padding: '6rpx 20rpx',
              borderRadius: '32rpx',
              fontSize: '22rpx',
              background: role === 'supervisor' ? '#fff' : 'rgba(255,255,255,0.2)',
              color: role === 'supervisor' ? '#FF7D00' : '#fff'
            }}
            onClick={() => setRole('supervisor')}
          >
            <Text>切换：监理视角</Text>
          </View>
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
        {rectifyItem.photos && rectifyItem.photos.length > 0 && (
          <View className={styles.photoGrid}>
            {rectifyItem.photos.map((p, i) => (
              <View key={i} className={styles.photoItem}>
                <Image className={styles.photoImg} src={p} mode="aspectFill" />
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
        {relatedInspection ? (
          <View className={styles.relatedCard} onClick={handleViewInspection}>
            <View className={styles.relatedIcon}>
              <Text>📋</Text>
            </View>
            <View className={styles.relatedInfo}>
              <Text className={styles.relatedTitle}>{relatedInspection.materialName}</Text>
              <Text className={styles.relatedDesc}>
                {relatedInspection.projectName} · {relatedInspection.buildingName}
              </Text>
              <Text className={styles.relatedDesc} style={{ color: '#F53F3F', marginTop: '4rpx' }}>
                {relatedInspection.specModel} · {relatedInspection.quantity}{relatedInspection.unit}
                {relatedInspection.discrepancies?.length > 0 && ` · ${relatedInspection.discrepancies.length}项不符`}
              </Text>
            </View>
            <Text className={styles.relatedArrow}>{'>'}</Text>
          </View>
        ) : (
          <Text style={{ fontSize: '26rpx', color: '#86909C' }}>未找到关联验收单</Text>
        )}
      </View>

      <View className={styles.section}>
        <View className={styles.sectionTitle}>
          <Text className={styles.sectionIcon}>⏱️</Text>
          <Text>整改进度时间线</Text>
        </View>

        <View className={styles.timeline}>
          <View className={styles.timelineItem}>
            <View className={classnames(styles.timelineDot, styles.dotWarning)} />
            <View className={styles.timelineContent}>
              <View className={styles.timelineHeader}>
                <Text className={styles.timelineTitle}>监理提交整改通知</Text>
              </View>
              <Text className={styles.timelineTime}>{rectifyItem.submitTime}</Text>
              <Text className={styles.timelineDesc}>{rectifyItem.description}</Text>
              {rectifyItem.photos && rectifyItem.photos.length > 0 && (
                <View className={styles.photoGrid}>
                  {rectifyItem.photos.map((p, i) => (
                    <View key={i} className={styles.photoItem}>
                      <Image className={styles.photoImg} src={p} mode="aspectFill" />
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>

          {rectifyItem.replies.map(reply => {
            const meta = getReplyTypeMeta(reply.type);
            return (
              <View key={reply.id} className={styles.timelineItem}>
                <View className={classnames(styles.timelineDot, styles[meta.cls])} />
                <View className={styles.timelineContent}>
                  <View className={styles.timelineHeader}>
                    <Text className={styles.timelineTitle} style={{ color: meta.color }}>
                      {meta.dot} {meta.label}
                    </Text>
                  </View>
                  <Text className={styles.timelineTime}>
                    {reply.time} · {reply.author}
                  </Text>
                  <Text className={styles.timelineDesc}>{reply.content}</Text>
                  {reply.photos && reply.photos.length > 0 && (
                    <View className={styles.photoGrid}>
                      {reply.photos.map((p, i) => (
                        <View key={i} className={styles.photoItem}>
                          <Image className={styles.photoImg} src={p} mode="aspectFill" />
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      </View>

      {canMaterialSubmit && (
        <View className={styles.section}>
          <View className={styles.sectionTitle}>
            <Text className={styles.sectionIcon}>📝</Text>
            <Text>提交整改回复（可多次补充）</Text>
          </View>
          <Textarea
            className={styles.textarea}
            placeholder='请填写整改情况说明，例如：已将不合格批次退场，重新进场合格材料...'
            value={replyText}
            onInput={e => setReplyText(e.detail.value)}
          />
          <View className={styles.uploadRow}>
            {uploadPhotos.map((photo, idx) => (
              <View key={idx} style={{ position: 'relative' }}>
                <View className={styles.photoItem}>
                  <Image className={styles.photoImg} src={photo} mode="aspectFill" />
                </View>
                <View
                  style={{
                    position: 'absolute', top: '4rpx', right: '4rpx',
                    width: '40rpx', height: '40rpx', borderRadius: '50%',
                    background: 'rgba(0,0,0,0.6)', color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '26rpx', zIndex: 2
                  }}
                  onClick={() => handleDeletePhoto(idx)}
                >
                  <Text>×</Text>
                </View>
              </View>
            ))}
            <View className={styles.uploadBtn} onClick={handleUpload}>
              <Text className={styles.uploadIcon}>+</Text>
              <Text>上传退场/补充资料</Text>
            </View>
          </View>
        </View>
      )}

      {canSupervisorAct && (
        <View className={styles.section}>
          <View className={styles.sectionTitle}>
            <Text className={styles.sectionIcon}>✅</Text>
            <Text>监理确认（基于最新回复）</Text>
          </View>
          <Textarea
            className={styles.textarea}
            placeholder='通过可留空或填写验收意见；退回请填写补充要求及原因'
            value={replyText}
            onInput={e => setReplyText(e.detail.value)}
          />
        </View>
      )}

      {(canMaterialSubmit || canSupervisorAct) && (
        <View className={styles.bottomBar}>
          {canMaterialSubmit && (
            <View
              className={classnames(styles.btnWarning, { [styles.disabled]: !replyText.trim() && uploadPhotos.length === 0 })}
              onClick={handleSubmitMaterialReply}
            >
              <Text>提交整改回复</Text>
            </View>
          )}
          {canSupervisorAct && (
            <>
              <View className={styles.btnSecondary} onClick={handleSupervisorReject}>
                <Text>退回补充</Text>
              </View>
              <View className={styles.btnPrimary} onClick={handleSupervisorPass}>
                <Text>确认整改通过</Text>
              </View>
            </>
          )}
        </View>
      )}
    </View>
  );
};

export default RectifyPage;
