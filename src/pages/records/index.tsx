import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Picker } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import StatusTag from '@/components/StatusTag';
import { materialCategoryLabelMap, statusLabelMap, mockProjects, mockBuildings } from '@/data/mock';
import { useInspection } from '@/store/inspectionContext';

const todayStr = () => {
  const d = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const statusFilters: { key: string; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'pending', label: '待验收' },
  { key: 'passed', label: '已通过' },
  { key: 'failed', label: '不通过' },
  { key: 'rectifying', label: '整改中' },
  { key: 'rectified', label: '整改完成' }
];

const categoryOptions: { key: string; label: string }[] = [
  { key: 'all', label: '全部类别' },
  { key: 'steel', label: '钢筋' },
  { key: 'mortar', label: '砂浆' },
  { key: 'waterproof', label: '防水卷材' },
  { key: 'concrete', label: '混凝土' },
  { key: 'brick', label: '砌块' },
  { key: 'other', label: '其他' }
];

const RecordsPage: React.FC = () => {
  const { records } = useInspection();
  const today = todayStr();

  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [showFilter, setShowFilter] = useState(false);
  const [filterProjectId, setFilterProjectId] = useState<string>('all');
  const [filterBuildingId, setFilterBuildingId] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterDateStart, setFilterDateStart] = useState<string>('');
  const [filterDateEnd, setFilterDateEnd] = useState<string>('');

  const projectStats = useMemo(() => {
    const stats: Record<string, Record<string, number>> = {};
    records.forEach(r => {
      const isToday = r.inspectTime && r.inspectTime.slice(0, 10) === today;
      if (!stats[r.projectId]) {
        stats[r.projectId] = {
          today: 0, passed: 0, failed: 0, rectifying: 0, projectName: r.projectName
        };
      }
      if (isToday) stats[r.projectId].today++;
      if (r.status === 'passed' || r.status === 'rectified') stats[r.projectId].passed++;
      if (r.status === 'failed') stats[r.projectId].failed++;
      if (r.status === 'rectifying') stats[r.projectId].rectifying++;
    });
    return stats;
  }, [records, today]);

  const filteredBuildings = useMemo(() => {
    if (filterProjectId === 'all') return mockBuildings;
    return mockBuildings.filter(b => b.projectId === filterProjectId);
  }, [filterProjectId]);

  const hasActiveFilters = useMemo(() => {
    return filterProjectId !== 'all' || filterBuildingId !== 'all' || filterCategory !== 'all'
      || filterStatus !== 'all' || filterDateStart !== '' || filterDateEnd !== '';
  }, [filterProjectId, filterBuildingId, filterCategory, filterStatus, filterDateStart, filterDateEnd]);

  const filteredRecords = useMemo(() => {
    let list = records;
    const effectiveStatus = filterStatus !== 'all' ? filterStatus : activeFilter;
    if (effectiveStatus !== 'all') {
      list = list.filter(r => r.status === effectiveStatus);
    }
    if (filterProjectId !== 'all') {
      list = list.filter(r => r.projectId === filterProjectId);
    }
    if (filterBuildingId !== 'all') {
      list = list.filter(r => r.buildingId === filterBuildingId);
    }
    if (filterCategory !== 'all') {
      list = list.filter(r => r.materialCategory === filterCategory);
    }
    if (filterDateStart) {
      list = list.filter(r => r.inspectTime && r.inspectTime.slice(0, 10) >= filterDateStart);
    }
    if (filterDateEnd) {
      list = list.filter(r => r.inspectTime && r.inspectTime.slice(0, 10) <= filterDateEnd);
    }
    return list;
  }, [records, activeFilter, filterProjectId, filterBuildingId, filterCategory, filterStatus, filterDateStart, filterDateEnd]);

  const stats = useMemo(() => {
    const total = records.length;
    const passed = records.filter(r => r.status === 'passed' || r.status === 'rectified').length;
    const pending = records.filter(r => r.status === 'pending' || r.status === 'rectifying').length;
    return { total, passed, pending };
  }, [records]);

  const resetFilters = () => {
    setFilterProjectId('all');
    setFilterBuildingId('all');
    setFilterCategory('all');
    setFilterStatus('all');
    setFilterDateStart('');
    setFilterDateEnd('');
    setActiveFilter('all');
  };

  const handleProjectClick = (projectId: string, statusKey: string) => {
    setFilterProjectId(projectId);
    setFilterBuildingId('all');
    setFilterStatus(statusKey === 'all' ? 'all' : statusKey);
    setActiveFilter('all');
    setShowFilter(false);
  };

  const handleProjectChange = (projectId: string) => {
    setFilterProjectId(projectId);
    setFilterBuildingId('all');
  };

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

  const pickerProjects = [{ id: 'all', name: '全部项目' }, ...mockProjects];
  const pickerBuildings = [{ id: 'all', name: '全部楼栋' }, ...filteredBuildings];

  const getStatusFilterLabel = () => {
    if (filterStatus !== 'all') {
      return statusFilters.find(s => s.key === filterStatus)?.label || '';
    }
    if (activeFilter !== 'all') {
      return statusFilters.find(s => s.key === activeFilter)?.label || '';
    }
    return '';
  };

  const getProjectFilterLabel = () => {
    if (filterProjectId === 'all') return '';
    const p = mockProjects.find(p => p.id === filterProjectId);
    return p ? p.name : '';
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

      <View className={styles.dashboardSection}>
        <View className={styles.dashboardHeader}>
          <Text className={styles.dashboardTitle}>📊 今日项目复盘看板</Text>
          <Text className={styles.dashboardDate}>{today}</Text>
        </View>
        <ScrollView scrollX className={styles.dashboardScroll}>
          <View className={styles.dashboardRow}>
            {mockProjects.map(project => {
              const ps = projectStats[project.id] || { today: 0, passed: 0, failed: 0, rectifying: 0, projectName: project.name };
              return (
                <View key={project.id} className={styles.dashboardCard}>
                  <Text className={styles.dashboardProject}>{project.name}</Text>
                  <View className={styles.dashboardGrid}>
                    <View
                      className={classnames(styles.dashboardBlock, styles.blockToday)}
                      onClick={() => handleProjectClick(project.id, 'all')}
                    >
                      <Text className={styles.dashboardBlockNum}>{ps.today}</Text>
                      <Text className={styles.dashboardBlockLabel}>今日到货</Text>
                    </View>
                    <View
                      className={classnames(styles.dashboardBlock, styles.blockPass)}
                      onClick={() => handleProjectClick(project.id, 'passed')}
                    >
                      <Text className={styles.dashboardBlockNum}>{ps.passed}</Text>
                      <Text className={styles.dashboardBlockLabel}>通过</Text>
                    </View>
                    <View
                      className={classnames(styles.dashboardBlock, styles.blockFail)}
                      onClick={() => handleProjectClick(project.id, 'failed')}
                    >
                      <Text className={styles.dashboardBlockNum}>{ps.failed}</Text>
                      <Text className={styles.dashboardBlockLabel}>不通过</Text>
                    </View>
                    <View
                      className={classnames(styles.dashboardBlock, styles.blockRect)}
                      onClick={() => handleProjectClick(project.id, 'rectifying')}
                    >
                      <Text className={styles.dashboardBlockNum}>{ps.rectifying}</Text>
                      <Text className={styles.dashboardBlockLabel}>整改中</Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        </ScrollView>
      </View>

      <View className={styles.toolbar}>
        <View className={styles.filterBtn} onClick={() => setShowFilter(!showFilter)}>
          <Text>🔍 高级筛选</Text>
          {hasActiveFilters && <View className={styles.filterDot} />}
        </View>
        <Text className={styles.filterResult}>
          共 {filteredRecords.length} 条
          {getProjectFilterLabel() && ` · ${getProjectFilterLabel()}`}
          {getStatusFilterLabel() && ` · ${getStatusFilterLabel()}`}
        </Text>
      </View>

      {showFilter && (
        <View className={styles.filterPanel}>
          <View className={styles.filterRow}>
            <Text className={styles.filterLabel}>项目</Text>
            <Picker
              mode='selector'
              range={pickerProjects}
              rangeKey='name'
              value={pickerProjects.findIndex(p => p.id === filterProjectId)}
              onChange={e => handleProjectChange(pickerProjects[e.detail.value].id)}
            >
              <View className={styles.filterSelect}>
                <Text>{pickerProjects.find(p => p.id === filterProjectId)?.name || '全部项目'}</Text>
                <Text className={styles.filterArrow}>▾</Text>
              </View>
            </Picker>
          </View>

          <View className={styles.filterRow}>
            <Text className={styles.filterLabel}>楼栋</Text>
            <Picker
              mode='selector'
              range={pickerBuildings}
              rangeKey='name'
              value={pickerBuildings.findIndex(b => b.id === filterBuildingId)}
              onChange={e => setFilterBuildingId(pickerBuildings[e.detail.value].id)}
            >
              <View className={styles.filterSelect}>
                <Text>{pickerBuildings.find(b => b.id === filterBuildingId)?.name || '全部楼栋'}</Text>
                <Text className={styles.filterArrow}>▾</Text>
              </View>
            </Picker>
          </View>

          <View className={styles.filterRow}>
            <Text className={styles.filterLabel}>材料类别</Text>
            <Picker
              mode='selector'
              range={categoryOptions}
              rangeKey='label'
              value={categoryOptions.findIndex(c => c.key === filterCategory)}
              onChange={e => setFilterCategory(categoryOptions[e.detail.value].key)}
            >
              <View className={styles.filterSelect}>
                <Text>{categoryOptions.find(c => c.key === filterCategory)?.label || '全部类别'}</Text>
                <Text className={styles.filterArrow}>▾</Text>
              </View>
            </Picker>
          </View>

          <View className={styles.filterRow}>
            <Text className={styles.filterLabel}>验收状态</Text>
            <Picker
              mode='selector'
              range={statusFilters}
              rangeKey='label'
              value={statusFilters.findIndex(s => s.key === filterStatus)}
              onChange={e => {
                setFilterStatus(statusFilters[e.detail.value].key);
                setActiveFilter('all');
              }}
            >
              <View className={styles.filterSelect}>
                <Text>{statusFilters.find(s => s.key === filterStatus)?.label || '全部状态'}</Text>
                <Text className={styles.filterArrow}>▾</Text>
              </View>
            </Picker>
          </View>

          <View className={styles.filterRow}>
            <Text className={styles.filterLabel}>日期范围</Text>
            <View className={styles.dateRange}>
              <Picker mode='date' value={filterDateStart} onChange={e => setFilterDateStart(e.detail.value)}>
                <View className={styles.datePick}>
                  <Text>{filterDateStart || '开始日期'}</Text>
                </View>
              </Picker>
              <Text className={styles.dateSep}>—</Text>
              <Picker mode='date' value={filterDateEnd} onChange={e => setFilterDateEnd(e.detail.value)}>
                <View className={styles.datePick}>
                  <Text>{filterDateEnd || '结束日期'}</Text>
                </View>
              </Picker>
            </View>
          </View>

          <View className={styles.filterActions}>
            <View className={styles.resetBtn} onClick={resetFilters}>
              <Text>重置</Text>
            </View>
            <View className={styles.applyBtn} onClick={() => setShowFilter(false)}>
              <Text>确定</Text>
            </View>
          </View>
        </View>
      )}

      <View className={styles.filterBar}>
        {statusFilters.map(item => (
          <View
            key={item.key}
            className={classnames(
              styles.filterItem,
              activeFilter === item.key && filterStatus === 'all' && styles.active
            )}
            onClick={() => {
              setActiveFilter(item.key);
              setFilterStatus('all');
            }}
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
            <Text className={styles.emptyText}>
              {records.length === 0 ? '暂无验收记录，点击右下角+新建' : '没有符合筛选条件的记录'}
            </Text>
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
