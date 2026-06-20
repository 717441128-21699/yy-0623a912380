import { InspectionRecord, RectifyItem, Project, Building, MaterialType, PhotoItem } from '@/types';

export const mockProjects: Project[] = [
  { id: 'p1', name: '阳光花园一期工程' },
  { id: 'p2', name: '滨江商务中心' },
  { id: 'p3', name: '翠湖天地住宅项目' }
];

export const mockBuildings: Building[] = [
  { id: 'b1', name: '1号楼', projectId: 'p1' },
  { id: 'b2', name: '2号楼', projectId: 'p1' },
  { id: 'b3', name: '3号楼', projectId: 'p1' },
  { id: 'b4', name: 'A座', projectId: 'p2' },
  { id: 'b5', name: 'B座', projectId: 'p2' },
  { id: 'b6', name: '5号楼', projectId: 'p3' }
];

export const mockMaterials: MaterialType[] = [
  { id: 'm1', name: '热轧带肋钢筋', category: 'steel', unit: '吨' },
  { id: 'm2', name: '光圆钢筋', category: 'steel', unit: '吨' },
  { id: 'm3', name: '砌筑砂浆', category: 'mortar', unit: '袋' },
  { id: 'm4', name: '抹灰砂浆', category: 'mortar', unit: '袋' },
  { id: 'm5', name: 'SBS改性沥青防水卷材', category: 'waterproof', unit: '卷' },
  { id: 'm6', name: '高分子防水卷材', category: 'waterproof', unit: '卷' },
  { id: 'm7', name: '商品混凝土', category: 'concrete', unit: 'm³' },
  { id: 'm8', name: '蒸压加气混凝土砌块', category: 'brick', unit: '块' }
];

const generatePhotos = (hasAll: boolean): PhotoItem[] => {
  const basePhotos: PhotoItem[] = [
    { id: 'photo1', category: 'plate', categoryLabel: '车牌', url: '', uploaded: false },
    { id: 'photo2', category: 'nameplate', categoryLabel: '铭牌', url: '', uploaded: false },
    { id: 'photo3', category: 'stacking', categoryLabel: '堆放位置', url: '', uploaded: false },
    { id: 'photo4', category: 'sampling', categoryLabel: '抽检部位', url: '', uploaded: false }
  ];
  if (hasAll) {
    return basePhotos.map((p, i) => ({
      ...p,
      uploaded: true,
      url: `https://picsum.photos/id/${200 + i * 10}/400/300`
    }));
  }
  return basePhotos;
};

export const mockInspectionRecords: InspectionRecord[] = [
  {
    id: 'ins1',
    projectId: 'p1',
    projectName: '阳光花园一期工程',
    buildingId: 'b1',
    buildingName: '1号楼',
    materialCategory: 'steel',
    materialName: '热轧带肋钢筋',
    supplier: '鞍钢集团有限公司',
    specModel: 'HRB400 φ16mm',
    batchNumber: '20240615023',
    quantity: 25.8,
    unit: '吨',
    certificateNumber: 'GZ202406150089',
    status: 'passed',
    discrepancies: [],
    photos: generatePhotos(true),
    inspector: '张监理',
    inspectTime: '2024-06-18 14:30',
    remark: '规格数量核对无误，质量证明文件齐全'
  },
  {
    id: 'ins2',
    projectId: 'p1',
    projectName: '阳光花园一期工程',
    buildingId: 'b2',
    buildingName: '2号楼',
    materialCategory: 'mortar',
    materialName: '砌筑砂浆',
    supplier: 'XX建材科技有限公司',
    specModel: 'M5 干混砌筑砂浆',
    batchNumber: '20240617045',
    quantity: 200,
    unit: '袋',
    certificateNumber: 'MZ202406170012',
    status: 'failed',
    discrepancies: [
      {
        field: 'quantity',
        label: '数量',
        expected: '200袋',
        actual: '186袋',
        description: '现场点验实际只有186袋，缺少14袋'
      }
    ],
    photos: generatePhotos(true),
    inspector: '李监理',
    inspectTime: '2024-06-18 09:15',
    remark: '数量不符，要求补送或缺料处理'
  },
  {
    id: 'ins3',
    projectId: 'p2',
    projectName: '滨江商务中心',
    buildingId: 'b4',
    buildingName: 'A座',
    materialCategory: 'waterproof',
    materialName: 'SBS改性沥青防水卷材',
    supplier: 'XX防水科技股份有限公司',
    specModel: 'SBS Ⅰ型 4mm',
    batchNumber: 'FS20240610078',
    quantity: 120,
    unit: '卷',
    certificateNumber: 'FS20240610056',
    status: 'rectifying',
    discrepancies: [
      {
        field: 'batchNumber',
        label: '批次号',
        expected: 'FS20240610078',
        actual: 'FS20240528034',
        description: '到货批次与报审批次不一致，生产日期提前两周'
      }
    ],
    photos: generatePhotos(true),
    inspector: '王监理',
    inspectTime: '2024-06-17 16:45',
    remark: '批次不符，正在整改中'
  },
  {
    id: 'ins4',
    projectId: 'p1',
    projectName: '阳光花园一期工程',
    buildingId: 'b3',
    buildingName: '3号楼',
    materialCategory: 'concrete',
    materialName: '商品混凝土',
    supplier: 'XX混凝土有限公司',
    specModel: 'C30',
    batchNumber: 'HN20240619012',
    quantity: 80,
    unit: 'm³',
    certificateNumber: 'HN20240619003',
    status: 'pending',
    discrepancies: [],
    photos: generatePhotos(false),
    inspector: '',
    inspectTime: '',
    remark: ''
  },
  {
    id: 'ins5',
    projectId: 'p3',
    projectName: '翠湖天地住宅项目',
    buildingId: 'b6',
    buildingName: '5号楼',
    materialCategory: 'brick',
    materialName: '蒸压加气混凝土砌块',
    supplier: 'XX新型建材有限公司',
    specModel: '600×200×200mm A3.5 B06',
    batchNumber: 'QK20240612056',
    quantity: 5000,
    unit: '块',
    certificateNumber: 'QK20240612021',
    status: 'passed',
    discrepancies: [],
    photos: generatePhotos(true),
    inspector: '赵监理',
    inspectTime: '2024-06-16 10:20',
    remark: '验收通过，规格型号符合要求'
  },
  {
    id: 'ins6',
    projectId: 'p2',
    projectName: '滨江商务中心',
    buildingId: 'b5',
    buildingName: 'B座',
    materialCategory: 'steel',
    materialName: '光圆钢筋',
    supplier: '宝钢集团',
    specModel: 'HPB300 φ8mm',
    batchNumber: '20240614089',
    quantity: 12.5,
    unit: '吨',
    certificateNumber: 'GZ202406140067',
    status: 'rectified',
    discrepancies: [
      {
        field: 'diameter',
        label: '直径',
        expected: '8mm',
        actual: '7.6mm',
        description: '现场游标卡尺测量直径偏差超过规范允许值'
      }
    ],
    photos: generatePhotos(true),
    inspector: '张监理',
    inspectTime: '2024-06-15 15:00',
    remark: '已更换合格批次，重新验收通过'
  }
];

export const mockRectifyItems: RectifyItem[] = [
  {
    id: 'r1',
    inspectionId: 'ins3',
    title: '防水卷材批次不符整改',
    description: '到货批次为FS20240528034，与报审批次FS20240610078不一致，请更换同批次材料或补充该批次质量证明文件。',
    status: 'processing',
    submitter: '王监理',
    submitTime: '2024-06-17 16:45',
    deadline: '2024-06-20',
    photos: ['https://picsum.photos/id/210/400/300', 'https://picsum.photos/id/211/400/300'],
    reply: '已联系厂家补发同批次产品，预计明日到场。已补充FS20240528034批次的合格证及检验报告。',
    replyTime: '2024-06-18 10:30'
  },
  {
    id: 'r2',
    inspectionId: 'ins2',
    title: '砌筑砂浆数量不足整改',
    description: '现场点验实际为186袋，缺少14袋，请补送或缺料处理。',
    status: 'pending',
    submitter: '李监理',
    submitTime: '2024-06-18 09:15',
    deadline: '2024-06-19',
    photos: ['https://picsum.photos/id/220/400/300'],
    reply: '',
    replyTime: ''
  },
  {
    id: 'r3',
    inspectionId: 'ins6',
    title: '钢筋直径偏差整改',
    description: 'φ8mm光圆钢筋现场实测直径7.6mm，超出规范允许偏差范围，需退场更换合格产品。',
    status: 'done',
    submitter: '张监理',
    submitTime: '2024-06-15 15:00',
    deadline: '2024-06-17',
    photos: ['https://picsum.photos/id/230/400/300', 'https://picsum.photos/id/231/400/300', 'https://picsum.photos/id/232/400/300'],
    reply: '已将不合格批次全部退场，重新进场HRB400 φ8mm钢筋2吨，经验收合格。',
    replyTime: '2024-06-16 14:20'
  }
];

export const statusLabelMap: Record<string, string> = {
  pending: '待验收',
  passed: '已通过',
  failed: '不通过',
  rectifying: '整改中',
  rectified: '整改完成'
};

export const materialCategoryLabelMap: Record<string, string> = {
  steel: '钢筋',
  mortar: '砂浆',
  waterproof: '防水卷材',
  concrete: '混凝土',
  brick: '砌块',
  other: '其他'
};
