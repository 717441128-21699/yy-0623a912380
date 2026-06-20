import React, { createContext, useContext, useState, ReactNode } from 'react';
import { InspectionRecord, RectifyItem, PhotoItem, DiscrepancyItem } from '@/types';
import { mockInspectionRecords, mockRectifyItems } from '@/data/mock';

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
  setCurrentInspection: (data: Partial<InspectionRecord> | null) => void;
  clearCurrentInspection: () => void;
}

const InspectionContext = createContext<InspectionContextType | undefined>(undefined);

export const InspectionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [records, setRecords] = useState<InspectionRecord[]>(mockInspectionRecords);
  const [rectifyItems, setRectifyItems] = useState<RectifyItem[]>(mockRectifyItems);
  const [currentInspection, setCurrentInspection] = useState<Partial<InspectionRecord> | null>(null);

  const addRecord = (record: InspectionRecord) => {
    setRecords(prev => [record, ...prev]);
    console.log('[Store] addRecord:', record.id, record.materialName);
  };

  const updateRecord = (id: string, updates: Partial<InspectionRecord>) => {
    setRecords(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
    console.log('[Store] updateRecord:', id, updates);
  };

  const getRecordById = (id: string) => {
    return records.find(r => r.id === id);
  };

  const addRectifyItem = (item: RectifyItem) => {
    setRectifyItems(prev => [item, ...prev]);
    console.log('[Store] addRectifyItem:', item.id, item.title);
  };

  const updateRectifyItem = (id: string, updates: Partial<RectifyItem>) => {
    setRectifyItems(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
    console.log('[Store] updateRectifyItem:', id, updates);
  };

  const getRectifyById = (id: string) => {
    return rectifyItems.find(r => r.id === id);
  };

  const clearCurrentInspection = () => {
    setCurrentInspection(null);
  };

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
        setCurrentInspection,
        clearCurrentInspection
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
