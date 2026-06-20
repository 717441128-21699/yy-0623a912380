import React, { useMemo } from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useRouter } from '@tarojs/taro';
import styles from './index.module.scss';
import StatusTag from '@/components/StatusTag';
import { mockInspectionRecords, materialCategoryLabelMap, statusLabelMap } from '@/data/mock';
import classnames from 'classnames';

const DetailPage: React.FC = () => {
  const router = useRouter();
  const id = router.params.id;

  const record = useMemo(() => {
    return mockInspectionRecords.find(r => r.id === id) || mockInspectionRecords[0];
  }, [id]);

  const history = useMemo(() => {
    if (!record) return [];
    const items: any[] = [
      {
        type: 'active',
        title: '创建验收单',
        time: record.inspectTime || '2024-06-18 09:00',
        desc: '监理工程师发起材料进场验收'
      }
    ];
    if (record.discrepancies.length > 0) {
      items.push({
        type: 'error',
        title: '发现不符项',
        time: record.inspectTime || '2024-06-18 09:15',
        desc: `共发现${record.discrepancies.length}项不符合要求，已生成整改通知`
      });
    }
    if (record.status === 'rectifying' || record.status === 'rectified') {
      items.push({
        type: 'active',
        title: '材料员整改回复',
        time: '2024-06-18 14:30',
        desc: '已提交整改回复及相关证明材料，等待监理确认'
      });
    }
    if (record.status === 'passed') {
      items.push({
        type: 'success',
        title: '验收通过',
        time: record.inspectTime,
        desc: '经验收，该批次材料符合要求，同意进场使用'
      });
    }
    if (record.status === 'rectified') {
      items.push({
        type: 'success',
        title: '整改完成，验收通过',
        time: '2024-06-19 10:00',
        desc: '复查确认整改合格，同意进场使用'
      });
    }
    return items;
  }, [record]);

  const handleViewRectify = () => {
    Taro.navigateTo({
      url: `/pages/rectify/index?id=r1`
    });
  };

  const handleReinspect = () => {
    Taro.showToast({
      title: '发起复验',
      icon: 'none'
    });
  };

  if (!record) {
    return (
      <View className={styles.page}>
        <Text>加载中...</Text>
      </View>
    );
  }

  const photosByCategory = [
    { key: 'plate', label: '车牌', icon: '🚚', photos: record.photos.filter(p => p.category === 'plate') },
    { key: 'nameplate', label: '铭牌', icon: '🏷️', photos: record.photos.filter(p => p.category === 'nameplate') },
    { key: 'stacking', label: '堆放位置', icon: '📍', photos: record.photos.filter(p => p.category === 'stacking') },
    { key: 'sampling', label: '抽检部位', icon: '🔍', photos: record.photos.filter(p => p.category === 'sampling') }
  ];

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <Text className={styles.materialName}>{record.materialName}</Text>
        <Text className={styles.specModel}>{record.specModel}</Text>
        <View className={styles.statusBadge}>
          <StatusTag status={record.status} text={statusLabelMap[record.status]} />
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionTitle}>
          <Text className={styles.sectionIcon}>📍</Text>
          <Text>项目信息</Text>
        </View>
        <View className={styles.infoRow}>
          <Text className={styles.infoLabel}>项目名称</Text>
          <Text className={styles.infoValue}>{record.projectName}</Text>
        </View>
        <View className={styles.infoRow}>
          <Text className={styles.infoLabel}>楼栋</Text>
          <Text className={styles.infoValue}>{record.buildingName}</Text>
        </View>
        <View className={styles.infoRow}>
          <Text className={styles.infoLabel}>材料类别</Text>
          <Text className={styles.infoValue}>{materialCategoryLabelMap[record.materialCategory]}</Text>
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionTitle}>
          <Text className={styles.sectionIcon}>📦</Text>
          <Text>材料信息</Text>
        </View>
        <View className={styles.infoRow}>
          <Text className={styles.infoLabel}>供应商</Text>
          <Text className={styles.infoValue}>{record.supplier}</Text>
        </View>
        <View className={styles.infoRow}>
          <Text className={styles.infoLabel}>规格型号</Text>
          <Text className={styles.infoValue}>{record.specModel}</Text>
        </View>
        <View className={styles.infoRow}>
          <Text className={styles.infoLabel}>批号</Text>
          <Text className={styles.infoValue}>{record.batchNumber}</Text>
        </View>
        <View className={styles.infoRow}>
          <Text className={styles.infoLabel}>数量</Text>
          <Text className={classnames(styles.infoValue, styles.quantity)}>
            {record.quantity} {record.unit}
          </Text>
        </View>
        <View className={styles.infoRow}>
          <Text className={styles.infoLabel}>合格证编号</Text>
          <Text className={styles.infoValue}>{record.certificateNumber}</Text>
        </View>
      </View>

      {record.discrepancies.length > 0 && (
        <View className={styles.section}>
          <View className={styles.sectionTitle}>
            <Text className={styles.sectionIcon}>⚠️</Text>
            <Text>不符项</Text>
          </View>
          <View className={styles.discrepancyList}>
            {record.discrepancies.map((disc, idx) => (
              <View key={idx} className={styles.discrepancyItem}>
                <Text className={styles.discLabel}>{disc.label}</Text>
                <View className={styles.discRow}>
                  <Text className={styles.discRowLabel}>报验值</Text>
                  <Text className={styles.discRowValue}>{disc.expected}</Text>
                </View>
                <View className={styles.discRow}>
                  <Text className={styles.discRowLabel}>实测值</Text>
                  <Text className={styles.discRowValue} style={{ color: '#F53F3F', fontWeight: 500 }}>
                    {disc.actual}
                  </Text>
                </View>
                {disc.description && (
                  <Text className={styles.discDesc}>{disc.description}</Text>
                )}
              </View>
            ))}
          </View>
          <View className={styles.actionRow}>
            <View className={classnames(styles.actionBtn, styles.btnOutline)} onClick={handleViewRectify}>
              <Text>查看整改详情</Text>
            </View>
          </View>
        </View>
      )}

      <View className={styles.section}>
        <View className={styles.sectionTitle}>
          <Text className={styles.sectionIcon}>📷</Text>
          <Text>现场照片</Text>
        </View>
        <View className={styles.photoSection}>
          {photosByCategory.map(cat => (
            <View key={cat.key} className={styles.photoCategory}>
              <Text className={styles.photoCatTitle}>
                <Text className={styles.photoCatIcon}>{cat.icon}</Text>
                {cat.label}
                {cat.photos.length === 0 && <Text style={{ color: '#F53F3F', fontSize: '22rpx', marginLeft: '8rpx' }}>(缺项)</Text>}
              </Text>
              <View className={styles.photoRow}>
                {cat.photos.length > 0 ? (
                  cat.photos.map(photo => (
                    <View key={photo.id} className={styles.photoItem}>
                      <Image className={styles.photoImg} src={photo.url} mode="aspectFill" />
                    </View>
                  ))
                ) : (
                  <View className={styles.photoMissing}>
                    <Text className={styles.missingIcon}>📷</Text>
                    <Text className={styles.missingText}>未拍摄</Text>
                  </View>
                )}
              </View>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionTitle}>
          <Text className={styles.sectionIcon}>📝</Text>
          <Text>验收备注</Text>
        </View>
        <View className={styles.remarkBox}>
          <Text>{record.remark || '暂无备注'}</Text>
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionTitle}>
          <Text className={styles.sectionIcon}>⏱️</Text>
          <Text>验收记录</Text>
        </View>
        <View className={styles.infoRow}>
          <Text className={styles.infoLabel}>监理工程师</Text>
          <Text className={styles.infoValue}>{record.inspector || '--'}</Text>
        </View>
        <View className={styles.infoRow}>
          <Text className={styles.infoLabel}>验收时间</Text>
          <Text className={styles.infoValue}>{record.inspectTime || '--'}</Text>
        </View>
        <View className={styles.historyTimeline} style={{ marginTop: '24rpx' }}>
          {history.map((item, idx) => (
            <View key={idx} className={styles.historyItem}>
              <View className={`${styles.historyDot} ${styles[item.type]}`} />
              <View className={styles.historyContent}>
                <Text className={styles.historyTitle}>{item.title}</Text>
                <Text className={styles.historyTime}>{item.time}</Text>
                <Text className={styles.historyDesc}>{item.desc}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {record.status === 'rectifying' && (
        <View className={styles.section}>
          <View className={styles.actionRow}>
            <View className={classnames(styles.actionBtn, styles.btnOutline)} onClick={handleReinspect}>
              <Text>发起复验</Text>
            </View>
            <View className={classnames(styles.actionBtn, styles.btnPrimary)} onClick={handleViewRectify}>
              <Text>处理整改</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default DetailPage;
