import React from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';

const MinePage: React.FC = () => {
  const menuGroups = [
    {
      title: '业务管理',
      items: [
        { icon: '🏗️', text: '项目管理', color: '#165DFF' },
        { icon: '📦', text: '材料类别设置', color: '#00B42A' },
        { icon: '👥', text: '供应商管理', color: '#FF7D00' }
      ]
    },
    {
      title: '工具',
      items: [
        { icon: '📊', text: '验收统计', color: '#722ED1' },
        { icon: '📝', text: '整改记录导出', color: '#14C9C9' },
        { icon: '⚙️', text: '系统设置', color: '#86909C' }
      ]
    },
    {
      title: '其他',
      items: [
        { icon: '❓', text: '帮助与反馈', color: '#86909C' },
        { icon: '📄', text: '关于我们', color: '#86909C' }
      ]
    }
  ];

  const handleMenuClick = (text: string) => {
    Taro.showToast({
      title: `${text}功能开发中`,
      icon: 'none'
    });
  };

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <View className={styles.userInfo}>
          <View className={styles.avatar}>
            <Text>张</Text>
          </View>
          <View className={styles.userDetail}>
            <Text className={styles.userName}>张监理</Text>
            <Text className={styles.userRole}>注册监理工程师 · 高级工程师</Text>
            <View className={styles.projectBadge}>
              <Text>当前项目：阳光花园一期</Text>
            </View>
          </View>
        </View>
      </View>

      <View className={styles.statsCard}>
        <View className={styles.statsItem}>
          <View className={styles.statsNum}>128</View>
          <View className={styles.statsLabel}>累计验收</View>
        </View>
        <View className={styles.statsItem}>
          <View className={styles.statsNum}>96.8%</View>
          <View className={styles.statsLabel}>通过率</View>
        </View>
        <View className={styles.statsItem}>
          <View className={styles.statsNum}>6</View>
          <View className={styles.statsLabel}>待处理</View>
        </View>
      </View>

      {menuGroups.map((group, gIdx) => (
        <View key={gIdx}>
          <Text className={styles.groupTitle}>{group.title}</Text>
          <View className={styles.menuGroup}>
            {group.items.map((item, idx) => (
              <View
                key={idx}
                className={styles.menuItem}
                onClick={() => handleMenuClick(item.text)}
              >
                <View
                  className={styles.menuIcon}
                  style={{ background: `${item.color}15`, color: item.color }}
                >
                  <Text>{item.icon}</Text>
                </View>
                <Text className={styles.menuText}>{item.text}</Text>
                <Text className={styles.menuArrow}>{'>'}</Text>
              </View>
            ))}
          </View>
        </View>
      ))}

      <Text className={styles.version}>材料进场验收 v1.0.0</Text>
    </View>
  );
};

export default MinePage;
