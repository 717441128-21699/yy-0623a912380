import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import Taro from '@tarojs/taro';
import { InspectionRecord, RectifyItem, RectifyReply, ReinspectionRecord } from '@/types';
import { mockInspectionRecords, mockRectifyItems } from '@/data/mock';

const LS_KEY_RECORDS = 'mi_records_v1';
const LS_KEY_RECTIFY = 'mi_rectify_v1';
const LS_KEY_CURRENT = 'mi_current_v1';
const LS_KEY_PHOTOS = 'mi_photos_v1';

const formatTime = () => {
  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
};

const genId = (prefix: string) => {
  return `${prefix}${Date.now()}${Math.floor(Math.random() * 1000)}`;
};

const convertPhotoToBase64 = (filePath: string): Promise<string> => {
  return new Promise((resolve) => {
    if (filePath.startsWith('data:')) {
      resolve(filePath);
      return;
    }
    if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
      resolve(filePath);
      return;
    }
    try {
      const fs = Taro.getFileSystemManager();
      fs.readFile({
        filePath,
        encoding: 'base64',
        success: (res) => {
          const ext = filePath.toLowerCase().endsWith('.png') ? 'png' : 'jpeg';
          resolve(`data:image/${ext};base64,${res.data}`);
        },
        fail: () => resolve(filePath)
      });
    } catch (e) {
      try {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', filePath, true);
        xhr.responseType = 'blob';
        xhr.onload = () => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string || filePath);
          reader.onerror = () => resolve(filePath);
          reader.readAsDataURL(xhr.response);
        };
        xhr.onerror = () => resolve(filePath);
        xhr.send();
      } catch (e2) {
        resolve(filePath);
      }
    }
  });
};

const convertPhotos = async (photos: string[]): Promise<string[]> => {
  const results = await Promise.all(photos.map(p => convertPhotoToBase64(p)));
  return results;
};

const readTaroStorage = async <T>(key: string, fallback: T): Promise<T> => {
  try {
    const res = await Taro.getStorage({ key });
    if (res && res.data !== null && res.data !== undefined) {
      return JSON.parse(res.data) as T;
    }
    return fallback;
  } catch (e) {
    console.warn('[Storage] read failed', key, e);
    return fallback;
  }
};

const writeTaroStorage = async (key: string, value: any) => {
  try {
    await Taro.setStorage({ key, data: JSON.stringify(value) });
  } catch (e) {
    console.warn('[Storage] write failed', key, e);
  }
};

interface InspectionContextType {
  records: InspectionRecord[];
  rectifyItems: RectifyItem[];
  currentInspection: Partial<InspectionRecord> | null;
  storageLoaded: boolean;
  addRecord: (record: InspectionRecord) => void;
  updateRecord: (id: string, updates: Partial<InspectionRecord>) => void;
  getRecordById: (id: string) => InspectionRecord | undefined;
  addRectifyItem: (item: RectifyItem) => void;
  updateRectifyItem: (id: string, updates: Partial<RectifyItem>) => void;
  getRectifyById: (id: string) => RectifyItem | undefined;
  addRectifyReply: (rectifyId: string, reply: Omit<RectifyReply, 'id' | 'time'>) => void;
  addReinspection: (rectifyId: string, replyId: string, reinspection: Omit<ReinspectionRecord, 'id' | 'replyId' | 'time'>) => void;
  findDuplicateRectify: (projectId: string, buildingId: string, materialName: string, batchNumber: string) => RectifyItem | undefined;
  setCurrentInspection: (data: Partial<InspectionRecord> | null) => void;
  clearCurrentInspection: () => void;
  persistPhotos: (photos: string[]) => Promise<string[]>;
  genRecordId: () => string;
  genRectifyId: () => string;
  formatCurrentTime: () => string;
}

const InspectionContext = createContext<InspectionContextType | undefined>(undefined);

export const InspectionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [records, setRecords] = useState<InspectionRecord[]>(mockInspectionRecords);
  const [rectifyItems, setRectifyItems] = useState<RectifyItem[]>(mockRectifyItems);
  const [currentInspection, setCurrentInspectionState] = useState<Partial<InspectionRecord> | null>(null);
  const [storageLoaded, setStorageLoaded] = useState(false);

  useEffect(() => {
    const init = async () => {
      const storedRecords = await readTaroStorage<InspectionRecord[]>(LS_KEY_RECORDS, mockInspectionRecords);
      const storedRectify = await readTaroStorage<RectifyItem[]>(LS_KEY_RECTIFY, mockRectifyItems);
      const storedCurrent = await readTaroStorage<Partial<InspectionRecord> | null>(LS_KEY_CURRENT, null);
      setRecords(storedRecords);
      setRectifyItems(storedRectify);
      setCurrentInspectionState(storedCurrent);
      setStorageLoaded(true);
    };
    init();
  }, []);

  useEffect(() => {
    if (!storageLoaded) return;
    writeTaroStorage(LS_KEY_RECORDS, records);
  }, [records, storageLoaded]);

  useEffect(() => {
    if (!storageLoaded) return;
    writeTaroStorage(LS_KEY_RECTIFY, rectifyItems);
  }, [rectifyItems, storageLoaded]);

  useEffect(() => {
    if (!storageLoaded) return;
    writeTaroStorage(LS_KEY_CURRENT, currentInspection);
  }, [currentInspection, storageLoaded]);

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

  const addReinspection = (rectifyId: string, replyId: string, reinspection: Omit<ReinspectionRecord, 'id' | 'replyId' | 'time'>) => {
    setRectifyItems(prev => prev.map(r => {
      if (r.id !== rectifyId) return r;
      const newReinspection: ReinspectionRecord = {
        ...reinspection,
        id: genId('re'),
        replyId,
        time: formatTime()
      };
      return {
        ...r,
        replies: r.replies.map(rep => {
          if (rep.id !== replyId) return rep;
          return { ...rep, reinspection: newReinspection };
        })
      };
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

  const persistPhotos = async (photos: string[]): Promise<string[]> => {
    return convertPhotos(photos);
  };

  return (
    <InspectionContext.Provider
      value={{
        records,
        rectifyItems,
        currentInspection,
        storageLoaded,
        addRecord,
        updateRecord,
        getRecordById,
        addRectifyItem,
        updateRectifyItem,
        getRectifyById,
        addRectifyReply,
        addReinspection,
        findDuplicateRectify,
        setCurrentInspection,
        clearCurrentInspection,
        persistPhotos,
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
