export type TransactionType = 'in' | 'out';

export interface StockEntry {
  id: string;
  type: TransactionType;
  date: string; // ISO yyyy-mm-dd
  modelName: string;
  modelNumber: string;
  serialNumber: string;
  hp: string;
  phase: string;
  quantity: number;
  party: string;
  invoiceNumber: string;
  remarks: string;
  photoUrl: string | null;
  createdAt: number;
  createdBy: string | null;
}

export type StockEntryInput = Omit<StockEntry, 'id' | 'createdAt' | 'createdBy'>;

export interface ModelAggregate {
  modelName: string;
  modelNumber: string;
  totalIn: number;
  totalOut: number;
  balance: number;
  lastInDate: string | null;
  lastOutDate: string | null;
}

export interface DateAggregate {
  date: string;
  totalIn: number;
  totalOut: number;
}
