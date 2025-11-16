export interface Product {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  price: number;
  description: string;
  category: string;
  harvestDate?: string | null;
  producer: {
    address: string;
    name: string;
  };
  status: 'active' | 'sold' | 'cancelled';
  createdAt: string;
  images?: string[]; // added so payload with images compiles
  updatedAt?: string;
  batchId?: string;
  metadataHash?: string;
  metadataPath?: string;
  workflowActor?: 'producer' | 'intermediary';
}