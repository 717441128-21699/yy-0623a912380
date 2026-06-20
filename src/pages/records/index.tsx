import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import StatusTag from '@/components/StatusTag';
import { materialCategoryLabelMap, statusLabelMap } from '@/data/mock';
import { useInspection } from '@/store/inspectionContext';

const statusFilters = [
  { key: 'all', label: '全部' },
  { key: 'pending', label: '待验收' },
  { key: 'passed', label: '已通过' },
  { key: 'failed', label: '不通过' },
  { key: 'rectifying', label: '整改中' }
];

const RecordsPage: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const { records } = useInspection();

  const filteredRecords = useMemo(() => {
    if (activeFilter === 'all') {
      return records;
    }
    return records.filter(r => r.status === activeFilter);
  }, [records, activeFilter]);

  const stats = useMemo(() => {
    const total = records.length;
    const passed = records.filter(r => r.status === 'passed' || r.status === 'rectified').length;
    const pending = records.filter(r => r.status === 'pending' || r.status === 'rectifying').length;
    return { total, passed, pending };
  }, [records]);

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
                  <Text className={styles.buildingName}>
                    {record.buildingName} · {materialCategoryLabelMap[record.materialCategory] || '其他'}
                  </Text>
                </View>
                <StatusTag status={record.status} text={statusLabelMap[record.status] || record.status} />
              </View>
              <View className={styles.cardBody}>
                <View className={styles.materialRow}>
                  <Text className={styles.materialName}>{record.materialName}</Text>
                  <Text className={styles.specModel}>{record.specModel}</Text>
                  <Text className={styles.quantity}>{record.quantity}{record.unit}</Text>
                </View>
                <View className={styles.supplierRow}>
                  <Text className={styles.supplierLabel}>供应商：</Text>
                  <Text className={styles.supplierName}>{record.supplier || '未填写'}</Text>
                </View>
                <View className={styles.supplierRow}>
                  <Text className={styles.supplierLabel}>合格证：</Text>
                  <Text className={styles.supplierName}>{record.certificateNumber || '未填写'}</Text>
                </View>
                {record.discrepancies && record.discrepancies.length > 0 && (
                  <View className={styles.supplierRow} style={{ color: '#F53F3F' }}>
                    <Text className={styles.supplierLabel}>不符项：</Text>
                    <Text className={styles.supplierName} style={{ color: '#F53F3F' }}>
                      {record.discrepancies.length}项不符
                    </Text>
                  </View>
                )}
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
            <Text className={styles.emptyText}>暂无验收记录，点击右下角+新建</Text>
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
