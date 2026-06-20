import React, { useState } from 'react';
import { View, Text, Input, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { mockProjects, mockBuildings, mockMaterials } from '@/data/mock';
import { Project, Building, MaterialType } from '@/types';

interface DiscrepancyField {
  key: string;
  label: string;
  expected: string;
  actual: string;
  checked: boolean;
}

const InspectionPage: React.FC = () => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);
  const [selectedMaterial, setSelectedMaterial] = useState<MaterialType | null>(null);

  const [supplier, setSupplier] = useState('');
  const [specModel, setSpecModel] = useState('');
  const [batchNumber, setBatchNumber] = useState('');
  const [quantity, setQuantity] = useState('');
  const [certificateNumber, setCertificateNumber] = useState('');

  const [showPicker, setShowPicker] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [voiceText, setVoiceText] = useState('');

  const [discrepancies, setDiscrepancies] = useState<DiscrepancyField[]>([
    { key: 'spec', label: '规格型号', expected: '', actual: '', checked: false },
    { key: 'batch', label: '批次号', expected: '', actual: '', checked: false },
    { key: 'quantity', label: '数量', expected: '', actual: '', checked: false },
    { key: 'certificate', label: '合格证编号', expected: '', actual: '', checked: false },
    { key: 'diameter', label: '钢筋直径', expected: '', actual: '', checked: false }
  ]);

  const filteredBuildings = selectedProject
    ? mockBuildings.filter(b => b.projectId === selectedProject.id)
    : [];

  const handleSelectProject = (project: Project) => {
    setSelectedProject(project);
    setSelectedBuilding(null);
    setShowPicker(null);
  };

  const handleSelectBuilding = (building: Building) => {
    setSelectedBuilding(building);
    setShowPicker(null);
  };

  const handleSelectMaterial = (material: MaterialType) => {
    setSelectedMaterial(material);
    setShowPicker(null);
  };

  const toggleDiscrepancy = (index: number) => {
    const newDisc = [...discrepancies];
    newDisc[index].checked = !newDisc[index].checked;
    if (newDisc[index].checked && !newDisc[index].expected) {
      if (newDisc[index].key === 'spec') newDisc[index].expected = specModel || '--';
      if (newDisc[index].key === 'batch') newDisc[index].expected = batchNumber || '--';
      if (newDisc[index].key === 'quantity') newDisc[index].expected = quantity || '--';
      if (newDisc[index].key === 'certificate') newDisc[index].expected = certificateNumber || '--';
      if (newDisc[index].key === 'diameter') newDisc[index].expected = '按规范要求';
    }
    setDiscrepancies(newDisc);
  };

  const updateActualValue = (index: number, value: string) => {
    const newDisc = [...discrepancies];
    newDisc[index].actual = value;
    setDiscrepancies(newDisc);
  };

  const handleVoiceRecord = () => {
    if (isRecording) {
      setIsRecording(false);
      setVoiceText(prev => prev + '现场实测钢筋直径为7.6mm，比规范要求的8mm偏小，已拍照留证。');
      Taro.showToast({
        title: '语音识别完成',
        icon: 'success'
      });
    } else {
      setIsRecording(true);
      Taro.showToast({
        title: '正在录音...',
        icon: 'none'
      });
    }
  };

  const handleNext = () => {
    if (!selectedProject || !selectedBuilding || !selectedMaterial) {
      Taro.showToast({
        title: '请选择项目、楼栋和材料类别',
        icon: 'none'
      });
      return;
    }
    Taro.navigateTo({
      url: '/pages/photo/index'
    });
  };

  const handlePass = () => {
    Taro.showModal({
      title: '确认验收通过',
      content: '确认该批次材料验收通过吗？',
      success: (res) => {
        if (res.confirm) {
          Taro.showToast({
            title: '验收通过',
            icon: 'success'
          });
          setTimeout(() => {
            Taro.navigateBack();
          }, 1500);
        }
      }
    });
  };

  const handleFail = () => {
    const activeDisc = discrepancies.filter(d => d.checked);
    if (activeDisc.length === 0) {
      Taro.showToast({
        title: '请至少选择一项不符项',
        icon: 'none'
      });
      return;
    }
    Taro.showModal({
      title: '确认验收不通过',
      content: `共${activeDisc.length}项不符，确认后将生成整改通知`,
      success: (res) => {
        if (res.confirm) {
          Taro.showToast({
            title: '已生成整改通知',
            icon: 'success'
          });
          setTimeout(() => {
            Taro.switchTab({
              url: '/pages/todo/index'
            });
          }, 1500);
        }
      }
    });
  };

  const renderPicker = () => {
    if (!showPicker) return null;

    let options: any[] = [];
    let selectedId = '';
    if (showPicker === 'project') {
      options = mockProjects;
      selectedId = selectedProject?.id || '';
    } else if (showPicker === 'building') {
      options = filteredBuildings;
      selectedId = selectedBuilding?.id || '';
    } else if (showPicker === 'material') {
      options = mockMaterials;
      selectedId = selectedMaterial?.id || '';
    }

    return (
      <View className={styles.pickerModal} onClick={() => setShowPicker(null)}>
        <View className={styles.pickerContent} onClick={e => e.stopPropagation()}>
          <View className={styles.pickerHeader}>
            <Text className={styles.pickerCancel} onClick={() => setShowPicker(null)}>取消</Text>
            <Text className={styles.pickerTitle}>
              {showPicker === 'project' ? '选择项目' : showPicker === 'building' ? '选择楼栋' : '选择材料'}
            </Text>
            <Text className={styles.pickerConfirm} onClick={() => setShowPicker(null)}>确定</Text>
          </View>
          <ScrollView scrollY className={styles.pickerOptions}>
            {options.map((opt: any) => (
              <View
                key={opt.id}
                className={classnames(styles.pickerOption, selectedId === opt.id && styles.selected)}
                onClick={() => {
                  if (showPicker === 'project') handleSelectProject(opt);
                  else if (showPicker === 'building') handleSelectBuilding(opt);
                  else if (showPicker === 'material') handleSelectMaterial(opt);
                }}
              >
                <Text>{opt.name}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    );
  };

  return (
    <View className={styles.page}>
      <View className={styles.section}>
        <View className={styles.sectionTitle}>
          <View className={styles.stepBadge}>1</View>
          <Text>基础信息</Text>
        </View>
        <View className={styles.formItem}>
          <Text className={styles.formLabel}>项目</Text>
          <View className={styles.formValue} onClick={() => setShowPicker('project')}>
            <Text className={selectedProject ? '' : styles.selectText}>
              {selectedProject ? selectedProject.name : '请选择项目'}
            </Text>
            <Text className={styles.arrow}>{'>'}</Text>
          </View>
        </View>
        <View className={styles.formItem}>
          <Text className={styles.formLabel}>楼栋</Text>
          <View className={styles.formValue} onClick={() => setShowPicker('building')}>
            <Text className={selectedBuilding ? '' : styles.selectText}>
              {selectedBuilding ? selectedBuilding.name : '请选择楼栋'}
            </Text>
            <Text className={styles.arrow}>{'>'}</Text>
          </View>
        </View>
        <View className={styles.formItem}>
          <Text className={styles.formLabel}>材料类别</Text>
          <View className={styles.formValue} onClick={() => setShowPicker('material')}>
            <Text className={selectedMaterial ? '' : styles.selectText}>
              {selectedMaterial ? selectedMaterial.name : '请选择材料'}
            </Text>
            <Text className={styles.arrow}>{'>'}</Text>
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionTitle}>
          <View className={styles.stepBadge}>2</View>
          <Text>到货信息核对</Text>
        </View>
        <View className={styles.formItem}>
          <Text className={styles.formLabel}>供应商</Text>
          <Input
            className={styles.inputField}
            placeholder='请输入供应商名称'
            placeholderClass={styles.selectText}
            value={supplier}
            onInput={e => setSupplier(e.detail.value)}
          />
        </View>
        <View className={styles.formItem}>
          <Text className={styles.formLabel}>规格型号</Text>
          <Input
            className={styles.inputField}
            placeholder='如 HRB400 φ16mm'
            placeholderClass={styles.selectText}
            value={specModel}
            onInput={e => setSpecModel(e.detail.value)}
          />
        </View>
        <View className={styles.formItem}>
          <Text className={styles.formLabel}>批号</Text>
          <Input
            className={styles.inputField}
            placeholder='请输入批号'
            placeholderClass={styles.selectText}
            value={batchNumber}
            onInput={e => setBatchNumber(e.detail.value)}
          />
        </View>
        <View className={styles.formItem}>
          <Text className={styles.formLabel}>数量</Text>
          <Input
            className={styles.inputField}
            placeholder='请输入数量'
            placeholderClass={styles.selectText}
            type='digit'
            value={quantity}
            onInput={e => setQuantity(e.detail.value)}
          />
        </View>
        <View className={styles.formItem}>
          <Text className={styles.formLabel}>合格证编号</Text>
          <Input
            className={styles.inputField}
            placeholder='请输入合格证编号'
            placeholderClass={styles.selectText}
            value={certificateNumber}
            onInput={e => setCertificateNumber(e.detail.value)}
          />
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionTitle}>
          <View className={styles.stepBadge}>3</View>
          <Text>不符项点选</Text>
        </View>
        <View className={styles.tipBox}>
          <Text className={styles.tipText}>
            💡 发现材料与报审资料不一致时，点选不符项并填写实测值
          </Text>
        </View>
        <View className={styles.discrepancyList}>
          {discrepancies.map((disc, index) => (
            <View
              key={disc.key}
              className={classnames(styles.discrepancyItem, disc.checked && styles.active)}
              onClick={() => toggleDiscrepancy(index)}
            >
              <View className={classnames(styles.checkbox, disc.checked && styles.checked)}>
                {disc.checked && <Text>✓</Text>}
              </View>
              <View className={styles.discContent}>
                <Text className={styles.discLabel}>{disc.label}</Text>
                {disc.checked && (
                  <>
                    <Text className={styles.discExpected}>报验值：{disc.expected}</Text>
                    <View className={styles.actualInputWrap}>
                      <Text className={styles.actualLabel}>实测值：</Text>
                      <Input
                        className={styles.actualInput}
                        placeholder='请输入实测值'
                        value={disc.actual}
                        onInput={e => updateActualValue(index, e.detail.value)}
                        onClick={e => e.stopPropagation()}
                      />
                    </View>
                  </>
                )}
              </View>
            </View>
          ))}
        </View>

        <View className={styles.voiceSection}>
          <Text className={styles.voiceTitle}>语音补充说明</Text>
          <View
            className={classnames(styles.voiceBtn, isRecording && styles.recording)}
            onClick={handleVoiceRecord}
          >
            <Text className={styles.voiceIcon}>{isRecording ? '🔴' : '🎤'}</Text>
            <Text>{isRecording ? '松开结束，正在录音...' : '按住说话，补充说明现场情况'}</Text>
          </View>
          {voiceText && (
            <View className={styles.voiceResult}>
              <Text>{voiceText}</Text>
            </View>
          )}
        </View>
      </View>

      <View className={styles.bottomBar}>
        <View className={styles.btnSecondary} onClick={handlePass}>
          <Text>验收通过</Text>
        </View>
        <View className={styles.btnPrimary} onClick={handleNext}>
          <Text>下一步：拍照留痕</Text>
        </View>
      </View>

      {renderPicker()}
    </View>
  );
};

export default InspectionPage;
