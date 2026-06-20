export interface Project {
  id: string;
  name: string;
}

export interface Building {
  id: string;
  name: string;
  projectId: string;
}

export type MaterialCategory = 'steel' | 'mortar' | 'waterproof' | 'concrete' | 'brick' | 'other';

export interface MaterialType {
  id: string;
  name: string;
  category: MaterialCategory;
  unit: string;
}

export type InspectionStatus = 'pending' | 'passed' | 'failed' | 'rectifying' | 'rectified';

export interface DiscrepancyItem {
  field: string;
  label: string;
  expected: string;
  actual: string;
  description?: string;
}

export type PhotoCategory = 'plate' | 'nameplate' | 'stacking' | 'sampling';

export interface PhotoItem {
  id: string;
  category: PhotoCategory;
  categoryLabel: string;
  url: string;
  uploaded: boolean;
}

export interface InspectionRecord {
  id: string;
  projectId: string;
  projectName: string;
  buildingId: string;
  buildingName: string;
  materialCategory: MaterialCategory;
  materialName: string;
  supplier: string;
  specModel: string;
  batchNumber: string;
  quantity: number;
  unit: string;
  certificateNumber: string;
  status: InspectionStatus;
  discrepancies: DiscrepancyItem[];
  photos: PhotoItem[];
  inspector: string;
  inspectTime: string;
  remark?: string;
}

export type RectifyReplyType = 'material_reply' | 'supervisor_pass' | 'supervisor_reject' | 'supervisor_reinspect';

export interface ReinspectionRecord {
  id: string;
  replyId: string;
  author: string;
  conclusion: 'passed' | 'rejected';
  content: string;
  photos: string[];
  time: string;
}

export interface RectifyReply {
  id: string;
  type: RectifyReplyType;
  role: 'material' | 'supervisor';
  author: string;
  content: string;
  photos: string[];
  time: string;
  reinspection?: ReinspectionRecord;
}

export interface RectifyItem {
  id: string;
  inspectionId: string;
  title: string;
  description: string;
  status: 'pending' | 'processing' | 'done';
  submitter: string;
  submitTime: string;
  deadline: string;
  photos: string[];
  replies: RectifyReply[];
}
