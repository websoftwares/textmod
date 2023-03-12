export interface User {
    username: string;
    password: string;
    email: string;
  }

  export interface ProductFeatures {
    name: string
  }

  export interface ProductName {
    name: string;
  }

  export interface ProductPrice {
    price: number;
    recurring: string;
    stripePriceId: string;
  }
  
  export type Product = ProductName & { features: ProductFeatures[] } & { prices: ProductPrice[] } ;