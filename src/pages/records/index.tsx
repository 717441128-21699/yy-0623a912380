import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import StatusTag from '@/components/StatusTag';
import { mockInspectionRecords, statusLabelMap, materialCategoryLabelMap } from '@/data/mock';
import { InspectionStatus } from '@/types';

const statusFilters = [
  { key: 'all', label: '全部' },
  { key: 'pending', label: '待验收' },
  { key: 'passed', label: '已通过' },
  { key: 'failed', label: '不通过' },
  { key: 'rectifying', label: '整改中' }
];

const RecordsPage: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<string>('all');

  const filteredRecords = useMemo(() => {
    if (activeFilter === 'all') {
      return mockInspectionRecords;
    }
    return mockInspectionRecords.filter(r => r.status === activeFilter);
  }, [activeFilter]);

  const stats = useMemo(() => {
    const total = mockInspectionRecords.length;
    const passed = mockInspectionRecords.filter(r => r.status === 'passed').length;
    const pending = mockInspectionRecords.filter(r => r.status === 'pending' || r.status === 'rectifying').length;
    return { total, passed, pending };
  }, []);

  const handleCardClick = (id: string) => {
    Taro.navigateTo({
      url: `/pages/detail/index?id=${id}`
    });
  };

  const handleNewInspection = () => {
    Taro.navigateTo({
      url: '/pages/inspection/index'
    });
  };

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <Text className={styles.headerTitle}>材料进场验收</Text>
        <Text className={styles.headerDesc}>监理工程师旁站验收管理</Text>
        <View className={styles.statsRow}>
          <View className={styles.statItem}>
            <View className={styles.statNum}>{stats.total}</View>
            <View className={styles.statLabel}>总验收</View>
          </View>
          <View className={styles.statItem}>
            <View className={styles.statNum}>{stats.passed}</View>
            <View className={styles.statLabel}>已通过</View>
          </View>
          <View className={styles.statItem}>
            <View className={styles.statNum}>{stats.pending}</View>
            <View className={styles.statLabel}>待处理</View>
          </View>
        </View>
      </View>

      <View className={styles.filterBar}>
        {statusFilters.map(item => (
          <View
            key={item.key}
            className={classnames(styles.filterItem, activeFilter === item.key && styles.active)}
            onClick={() => setActiveFilter(item.key)}
          >
            <Text>{item.label}</Text>
          </View>
        ))}
      </View>

      <ScrollView scrollY className={styles.list}>
        {filteredRecords.length > 0 ? (
          filteredRecords.map(record => (
            <View
              key={record.id}
              className={styles.card}
              onClick={() => handleCardClick(record.id)}
            >
              <View className={styles.cardHeader}>
                <View className={styles.projectInfo}>
                  <Text className={styles.projectName}>{record.projectName}</Text>
                  <Text className={styles.buildingName}>{record.buildingName} · {materialCategoryLabelMap[record.materialCategory]}</Text>
                </View>
                <StatusTag status={record.status} text={statusLabelMap[record.status]} />
              </View>
              <View className={styles.cardBody}>
                <View className={styles.materialRow}>
                  <Text className={styles.materialName}>{record.materialName}</Text>
                  <Text className={styles.specModel}>{record.specModel}</Text>
                  <Text className={styles.quantity}>{record.quantity}{record.unit}</Text>
                </View>
                <View className={styles.supplierRow}>
                  <Text className={styles.supplierLabel}>供应商：</Text>
                  <Text className={styles.supplierName}>{record.supplier}</Text>
                </View>
                <View className={styles.supplierRow}>
                  <Text className={styles.supplierLabel}>合格证：</Text>
                  <Text className={styles.supplierName}>{record.certificateNumber}</Text>
                </View>
              </View>
              <View className={styles.cardFooter}>
                <Text className={styles.inspector}>
                  {record.inspector ? `监理：${record.inspector}` : '待验收'}
                </Text>
                <Text className={styles.inspectTime}>
                  {record.inspectTime || '--'}
                </Text>
              </View>
            </View>
          ))
        ) : (
          <View className={styles.empty}>
            <Text className={styles.emptyIcon}>📋</Text>
            <Text className={styles.emptyText}>暂无验收记录</Text>
          </View>
        )}
      </ScrollView>

      <View className={styles.fab} onClick={handleNewInspection}>
        <Text>+</Text>
      </View>
    </View>
  );
};

export default RecordsPage;
