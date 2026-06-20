import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import StatusTag from '@/components/StatusTag';
import { useInspection } from '@/store/inspectionContext';

const statusTabs = [
  { key: 'pending', label: '待处理' },
  { key: 'processing', label: '处理中' },
  { key: 'done', label: '已完成' }
];

const TodoPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('pending');
  const { rectifyItems, records } = useInspection();

  const filteredItems = useMemo(() => {
    return rectifyItems.filter(item => {
      if (activeTab === 'pending') return item.status === 'pending';
      if (activeTab === 'processing') return item.status === 'processing';
      if (activeTab === 'done') return item.status === 'done';
      return true;
    });
  }, [rectifyItems, activeTab]);

  const stats = useMemo(() => {
    const pending = rectifyItems.filter(r => r.status === 'pending').length;
    const processing = rectifyItems.filter(r => r.status === 'processing').length;
    const done = rectifyItems.filter(r => r.status === 'done').length;
    return { pending, processing, done, total: rectifyItems.length };
  }, [rectifyItems]);

  const getItemInfo = (inspectionId: string) => {
    const rec = records.find(r => r.id === inspectionId);
    if (rec) {
      return `${rec.projectName} · ${rec.buildingName} · ${rec.materialName}`;
    }
    return '';
  };

  const handleItemClick = (id: string) => {
    Taro.navigateTo({
      url: `/pages/rectify/index?id=${id}`
    });
  };

  const isUrgent = (deadline: string) => {
    const today = new Date();
    const dl = new Date(deadline);
    const diff = Math.ceil((dl.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff <= 2;
  };

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <Text className={styles.headerTitle}>待办整改</Text>
        <Text className={styles.headerDesc}>整改事项跟踪管理</Text>
        <View className={styles.statsRow}>
          <View className={styles.statItem}>
            <View className={styles.statNum}>{stats.pending}</View>
            <View className={styles.statLabel}>待处理</View>
          </View>
          <View className={styles.statItem}>
            <View className={styles.statNum}>{stats.processing}</View>
            <View className={styles.statLabel}>处理中</View>
          </View>
          <View className={styles.statItem}>
            <View className={styles.statNum}>{stats.done}</View>
            <View className={styles.statLabel}>已完成</View>
          </View>
        </View>
      </View>

      <View className={styles.tabBar}>
        {statusTabs.map(tab => (
          <View
            key={tab.key}
            className={classnames(styles.tabItem, activeTab === tab.key && styles.active)}
            onClick={() => setActiveTab(tab.key)}
          >
            <Text>{tab.label}</Text>
            {activeTab === tab.key && <View className={styles.tabIndicator} />}
          </View>
        ))}
      </View>

      <ScrollView scrollY className={styles.list}>
        {filteredItems.length > 0 ? (
          filteredItems.map(item => (
            <View
              key={item.id}
              className={styles.card}
              onClick={() => handleItemClick(item.id)}
            >
              <View className={styles.cardHeader}>
                <Text className={styles.cardTitle}>{item.title}</Text>
                <StatusTag
                  status={item.status}
                  text={
                    item.status === 'pending' ? '待处理' :
                    item.status === 'processing' ? '处理中' : '已完成'
                  }
                />
              </View>
              <Text className={styles.desc}>{item.description}</Text>
              <View className={styles.metaRow}>
                <Text className={styles.metaLabel}>项目信息</Text>
                <Text className={styles.metaValue}>{getItemInfo(item.inspectionId) || '暂无关联'}</Text>
              </View>
              <View className={styles.metaRow}>
                <Text className={styles.metaLabel}>提交人</Text>
                <Text className={styles.metaValue}>{item.submitter}</Text>
              </View>
              <View className={styles.metaRow}>
                <Text className={styles.metaLabel}>提交时间</Text>
                <Text className={styles.metaValue}>{item.submitTime}</Text>
              </View>
              <View className={styles.metaRow}>
                <Text className={styles.metaLabel}>截止日期</Text>
                <Text className={classnames(styles.metaValue, isUrgent(item.deadline) && styles.urgent)}>
                  {item.deadline}
                  {isUrgent(item.deadline) && item.status !== 'done' && ' (临近到期)'}
                </Text>
              </View>
              {item.photos.length > 0 && (
                <View className={styles.photoPreview}>
                  {item.photos.slice(0, 3).map((photo, idx) => (
                    <View key={idx} className={styles.photoThumb}>
                      <Image className={styles.photoImg} src={photo} mode="aspectFill" />
                    </View>
                  ))}
                </View>
              )}
              <View className={styles.cardFooter}>
                <Text className={styles.submitter}>
                  {item.reply ? '材料员已回复，待监理确认' : '等待材料员处理'}
                </Text>
                {isUrgent(item.deadline) && item.status !== 'done' && (
                  <View className={styles.deadlineTag}>
                    <Text>紧急</Text>
                  </View>
                )}
              </View>
            </View>
          ))
        ) : (
          <View className={styles.empty}>
            <Text className={styles.emptyIcon}>✅</Text>
            <Text className={styles.emptyText}>
              暂无{activeTab === 'pending' ? '待处理' : activeTab === 'processing' ? '处理中' : '已完成'}事项
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default TodoPage;
