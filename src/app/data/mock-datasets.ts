export interface UserRecord {
  id: number;
  name: string;
  email: string;
  age: number;
  country: string;
  status: "active" | "inactive" | "suspended";
  role: "admin" | "user" | "moderator";
  purchases: number;
  createdAt: string;
  lastLoginAt: string;
}

export interface OrderRecord {
  id: number;
  userId: number;
  total: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  paymentMethod: "card" | "paypal" | "bank_transfer" | "crypto";
  itemCount: number;
  createdAt: string;
  shippedAt: string | null;
}

export interface ProductRecord {
  id: number;
  name: string;
  category: "electronics" | "clothing" | "food" | "books" | "home";
  price: number;
  stock: number;
  rating: number;
  inStock: boolean;
  createdAt: string;
}

export const MOCK_USERS: UserRecord[] = [
  {
    id: 1,
    name: "Amara Okafor",
    email: "amara@example.com",
    age: 28,
    country: "Nigeria",
    status: "active",
    role: "user",
    purchases: 14,
    createdAt: "2023-01-15",
    lastLoginAt: "2024-11-01",
  },
  {
    id: 2,
    name: "James Carter",
    email: "james@example.com",
    age: 34,
    country: "USA",
    status: "active",
    role: "admin",
    purchases: 3,
    createdAt: "2022-06-10",
    lastLoginAt: "2024-10-28",
  },
  {
    id: 3,
    name: "Yuki Tanaka",
    email: "yuki@example.com",
    age: 22,
    country: "Japan",
    status: "inactive",
    role: "user",
    purchases: 0,
    createdAt: "2023-09-03",
    lastLoginAt: "2024-08-14",
  },
  {
    id: 4,
    name: "Sofia Martínez",
    email: "sofia@example.com",
    age: 31,
    country: "Mexico",
    status: "active",
    role: "moderator",
    purchases: 27,
    createdAt: "2021-11-22",
    lastLoginAt: "2024-11-02",
  },
  {
    id: 5,
    name: "Kwame Asante",
    email: "kwame@example.com",
    age: 19,
    country: "Ghana",
    status: "active",
    role: "user",
    purchases: 5,
    createdAt: "2024-01-08",
    lastLoginAt: "2024-10-30",
  },
  {
    id: 6,
    name: "Priya Nair",
    email: "priya@example.com",
    age: 26,
    country: "India",
    status: "suspended",
    role: "user",
    purchases: 2,
    createdAt: "2023-04-17",
    lastLoginAt: "2024-07-22",
  },
  {
    id: 7,
    name: "Luca Rossi",
    email: "luca@example.com",
    age: 45,
    country: "Italy",
    status: "active",
    role: "user",
    purchases: 38,
    createdAt: "2020-08-30",
    lastLoginAt: "2024-11-01",
  },
  {
    id: 8,
    name: "Fatima Al-Hassan",
    email: "fatima@example.com",
    age: 33,
    country: "Nigeria",
    status: "active",
    role: "moderator",
    purchases: 19,
    createdAt: "2022-03-14",
    lastLoginAt: "2024-10-25",
  },
  {
    id: 9,
    name: "Chen Wei",
    email: "chen@example.com",
    age: 17,
    country: "China",
    status: "inactive",
    role: "user",
    purchases: 1,
    createdAt: "2024-03-21",
    lastLoginAt: "2024-09-10",
  },
  {
    id: 10,
    name: "Aisha Diallo",
    email: "aisha@example.com",
    age: 24,
    country: "Senegal",
    status: "active",
    role: "user",
    purchases: 11,
    createdAt: "2023-07-05",
    lastLoginAt: "2024-11-03",
  },
  {
    id: 11,
    name: "Marco Oliveira",
    email: "marco@example.com",
    age: 29,
    country: "Brazil",
    status: "active",
    role: "user",
    purchases: 7,
    createdAt: "2023-02-18",
    lastLoginAt: "2024-10-15",
  },
  {
    id: 12,
    name: "Nadia Kowalski",
    email: "nadia@example.com",
    age: 38,
    country: "Poland",
    status: "suspended",
    role: "user",
    purchases: 0,
    createdAt: "2022-12-01",
    lastLoginAt: "2024-06-30",
  },
  {
    id: 13,
    name: "Emeka Eze",
    email: "emeka@example.com",
    age: 21,
    country: "Nigeria",
    status: "active",
    role: "user",
    purchases: 16,
    createdAt: "2023-10-11",
    lastLoginAt: "2024-11-02",
  },
  {
    id: 14,
    name: "Hannah Schmidt",
    email: "hannah@example.com",
    age: 55,
    country: "Germany",
    status: "active",
    role: "admin",
    purchases: 42,
    createdAt: "2019-05-20",
    lastLoginAt: "2024-10-31",
  },
  {
    id: 15,
    name: "Ali Hassan",
    email: "ali@example.com",
    age: 27,
    country: "Egypt",
    status: "active",
    role: "user",
    purchases: 9,
    createdAt: "2023-06-14",
    lastLoginAt: "2024-10-20",
  },
];

export const MOCK_ORDERS: OrderRecord[] = [
  {
    id: 1,
    userId: 1,
    total: 149.99,
    status: "delivered",
    paymentMethod: "card",
    itemCount: 3,
    createdAt: "2024-10-01",
    shippedAt: "2024-10-03",
  },
  {
    id: 2,
    userId: 4,
    total: 299.0,
    status: "shipped",
    paymentMethod: "paypal",
    itemCount: 5,
    createdAt: "2024-10-15",
    shippedAt: "2024-10-17",
  },
  {
    id: 3,
    userId: 7,
    total: 59.99,
    status: "delivered",
    paymentMethod: "card",
    itemCount: 1,
    createdAt: "2024-09-20",
    shippedAt: "2024-09-22",
  },
  {
    id: 4,
    userId: 2,
    total: 899.0,
    status: "processing",
    paymentMethod: "bank_transfer",
    itemCount: 2,
    createdAt: "2024-11-01",
    shippedAt: null,
  },
  {
    id: 5,
    userId: 8,
    total: 34.5,
    status: "pending",
    paymentMethod: "card",
    itemCount: 1,
    createdAt: "2024-11-03",
    shippedAt: null,
  },
  {
    id: 6,
    userId: 13,
    total: 210.0,
    status: "delivered",
    paymentMethod: "crypto",
    itemCount: 4,
    createdAt: "2024-08-10",
    shippedAt: "2024-08-13",
  },
  {
    id: 7,
    userId: 5,
    total: 75.0,
    status: "cancelled",
    paymentMethod: "paypal",
    itemCount: 2,
    createdAt: "2024-10-22",
    shippedAt: null,
  },
  {
    id: 8,
    userId: 14,
    total: 450.0,
    status: "delivered",
    paymentMethod: "card",
    itemCount: 6,
    createdAt: "2024-07-30",
    shippedAt: "2024-08-02",
  },
];

export const MOCK_PRODUCTS: ProductRecord[] = [
  {
    id: 1,
    name: "Wireless Headphones",
    category: "electronics",
    price: 129.99,
    stock: 45,
    rating: 4.5,
    inStock: true,
    createdAt: "2023-01-10",
  },
  {
    id: 2,
    name: "Running Shoes",
    category: "clothing",
    price: 89.99,
    stock: 120,
    rating: 4.2,
    inStock: true,
    createdAt: "2023-03-15",
  },
  {
    id: 3,
    name: "Python Cookbook",
    category: "books",
    price: 39.99,
    stock: 0,
    rating: 4.8,
    inStock: false,
    createdAt: "2022-11-20",
  },
  {
    id: 4,
    name: "Mechanical Keyboard",
    category: "electronics",
    price: 199.99,
    stock: 23,
    rating: 4.7,
    inStock: true,
    createdAt: "2023-06-05",
  },
  {
    id: 5,
    name: "Organic Coffee Beans",
    category: "food",
    price: 24.99,
    stock: 200,
    rating: 4.6,
    inStock: true,
    createdAt: "2023-08-01",
  },
  {
    id: 6,
    name: "Desk Lamp",
    category: "home",
    price: 49.99,
    stock: 0,
    rating: 3.9,
    inStock: false,
    createdAt: "2023-02-28",
  },
  {
    id: 7,
    name: "Yoga Mat",
    category: "clothing",
    price: 34.99,
    stock: 88,
    rating: 4.3,
    inStock: true,
    createdAt: "2023-05-12",
  },
  {
    id: 8,
    name: "Smart Watch",
    category: "electronics",
    price: 349.99,
    stock: 15,
    rating: 4.4,
    inStock: true,
    createdAt: "2023-09-18",
  },
];

export const MOCK_DATASETS: Record<string, Record<string, unknown>[]> = {
  users: MOCK_USERS as unknown as Record<string, unknown>[],
  orders: MOCK_ORDERS as unknown as Record<string, unknown>[],
  products: MOCK_PRODUCTS as unknown as Record<string, unknown>[],
};
