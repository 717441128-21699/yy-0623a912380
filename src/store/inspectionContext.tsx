import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { InspectionRecord, RectifyItem, RectifyReply } from '@/types';
import { mockInspectionRecords, mockRectifyItems } from '@/data/mock';

const LS_KEY_RECORDS = 'mi_records_v1';
const LS_KEY_RECTIFY = 'mi_rectify_v1';
const LS_KEY_CURRENT = 'mi_current_v1';

const formatTime = () => {
  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
};

const genId = (prefix: string) => {
  return `${prefix}${Date.now()}${Math.floor(Math.random() * 1000)}`;
};

const readLS = <T>(key: string, fallback: T): T => {
  try {
    if (typeof localStorage === 'undefined') return fallback;
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch (e) {
    console.warn('[LS] read failed', key, e);
    return fallback;
  }
};

const writeLS = (key: string, value: any) => {
  try {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn('[LS] write failed', key, e);
  }
};

interface InspectionContextType {
  records: InspectionRecord[];
  rectifyItems: RectifyItem[];
  currentInspection: Partial<InspectionRecord> | null;
  addRecord: (record: InspectionRecord) => void;
  updateRecord: (id: string, updates: Partial<InspectionRecord>) => void;
  getRecordById: (id: string) => InspectionRecord | undefined;
  addRectifyItem: (item: RectifyItem) => void;
  updateRectifyItem: (id: string, updates: Partial<RectifyItem>) => void;
  getRectifyById: (id: string) => RectifyItem | undefined;
  addRectifyReply: (rectifyId: string, reply: Omit<RectifyReply, 'id' | 'time'>) => void;
  findDuplicateRectify: (projectId: string, buildingId: string, materialName: string, batchNumber: string) => RectifyItem | undefined;
  setCurrentInspection: (data: Partial<InspectionRecord> | null) => void;
  clearCurrentInspection: () => void;
  genRecordId: () => string;
  genRectifyId: () => string;
  formatCurrentTime: () => string;
}

const InspectionContext = createContext<InspectionContextType | undefined>(undefined);

export const InspectionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [records, setRecords] = useState<InspectionRecord[]>(() => readLS(LS_KEY_RECORDS, mockInspectionRecords));
  const [rectifyItems, setRectifyItems] = useState<RectifyItem[]>(() => readLS(LS_KEY_RECTIFY, mockRectifyItems));
  const [currentInspection, setCurrentInspectionState] = useState<Partial<InspectionRecord> | null>(() => readLS(LS_KEY_CURRENT, null));

  useEffect(() => { writeLS(LS_KEY_RECORDS, records); }, [records]);
  useEffect(() => { writeLS(LS_KEY_RECTIFY, rectifyItems); }, [rectifyItems]);
  useEffect(() => { writeLS(LS_KEY_CURRENT, currentInspection); }, [currentInspection]);

  const addRecord = (record: InspectionRecord) => {
    setRecords(prev => [record, ...prev]);
  };

  const updateRecord = (id: string, updates: Partial<InspectionRecord>) => {
    setRecords(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
  };

  const getRecordById = (id: string) => records.find(r => r.id === id);

  const addRectifyItem = (item: RectifyItem) => {
    setRectifyItems(prev => [item, ...prev]);
  };

  const updateRectifyItem = (id: string, updates: Partial<RectifyItem>) => {
    setRectifyItems(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
  };

  const getRectifyById = (id: string) => rectifyItems.find(r => r.id === id);

  const addRectifyReply = (rectifyId: string, reply: Omit<RectifyReply, 'id' | 'time'>) => {
    setRectifyItems(prev => prev.map(r => {
      if (r.id !== rectifyId) return r;
      const newReply: RectifyReply = {
        ...reply,
        id: genId('rp'),
        time: formatTime()
      };
      return { ...r, replies: [...r.replies, newReply] };
    }));
  };

  const findDuplicateRectify = (projectId: string, buildingId: string, materialName: string, batchNumber: string) => {
    return rectifyItems.find(r => {
      if (r.status === 'done') return false;
      const rec = records.find(rc => rc.id === r.inspectionId);
      if (!rec) return false;
      return rec.projectId === projectId
        && rec.buildingId === buildingId
        && rec.materialName === materialName
        && rec.batchNumber === batchNumber;
    });
  };

  const setCurrentInspection = (data: Partial<InspectionRecord> | null) => {
    setCurrentInspectionState(data);
  };

  const clearCurrentInspection = () => setCurrentInspectionState(null);

  return (
    <InspectionContext.Provider
      value={{
        records,
        rectifyItems,
        currentInspection,
        addRecord,
        updateRecord,
        getRecordById,
        addRectifyItem,
        updateRectifyItem,
        getRectifyById,
        addRectifyReply,
        findDuplicateRectify,
        setCurrentInspection,
        clearCurrentInspection,
        genRecordId: () => genId('ins'),
        genRectifyId: () => genId('r'),
        formatCurrentTime: formatTime
      }}
    >
      {children}
    </InspectionContext.Provider>
  );
};

export const useInspection = () => {
  const context = useContext(InspectionContext);
  if (!context) {
    throw new Error('useInspection must be used within InspectionProvider');
  }
  return context;
};
