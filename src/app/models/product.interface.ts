export interface Quantity {
  value: number;
  unit: string;
}

export interface Price {
  value?: number;
  quantity: Quantity;
}

export interface Subproduct {
  _id?: string;
  quantity?: Quantity;
  product?: Product | string;
}

export interface Product {
  _id?: string;
  name?: string;
  price?: number;
  unit?: Quantity;
  type?: string;
  subproducts?: Subproduct[];
}
