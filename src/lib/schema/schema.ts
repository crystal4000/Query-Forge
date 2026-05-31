import type { Schema } from "@/lib/query-engine/types"

export const SCHEMAS: Schema[] = [
  {
    id: "users",
    name: "users",
    icon: "users",
    fields: [
      { key: "id", label: "ID", type: "number" },
      { key: "name", label: "Name", type: "string" },
      { key: "email", label: "Email", type: "string" },
      { key: "age", label: "Age", type: "number" },
      { key: "country", label: "Country", type: "string" },
      {
        key: "status",
        label: "Status",
        type: "enum",
        enumValues: ["active", "inactive", "suspended"],
      },
      {
        key: "role",
        label: "Role",
        type: "enum",
        enumValues: ["admin", "user", "moderator"],
      },
      { key: "purchases", label: "Purchases", type: "number" },
      { key: "createdAt", label: "Created At", type: "date" },
      { key: "lastLoginAt", label: "Last Login", type: "date" },
    ],
  },
  {
    id: "orders",
    name: "orders",
    icon: "shopping-cart",
    fields: [
      { key: "id", label: "ID", type: "number" },
      { key: "userId", label: "User ID", type: "number" },
      { key: "total", label: "Total", type: "number" },
      {
        key: "status",
        label: "Status",
        type: "enum",
        enumValues: ["pending", "processing", "shipped", "delivered", "cancelled"],
      },
      {
        key: "paymentMethod",
        label: "Payment Method",
        type: "enum",
        enumValues: ["card", "paypal", "bank_transfer", "crypto"],
      },
      { key: "itemCount", label: "Item Count", type: "number" },
      { key: "createdAt", label: "Created At", type: "date" },
      { key: "shippedAt", label: "Shipped At", type: "date" },
    ],
  },
  {
    id: "products",
    name: "products",
    icon: "box",
    fields: [
      { key: "id", label: "ID", type: "number" },
      { key: "name", label: "Name", type: "string" },
      {
        key: "category",
        label: "Category",
        type: "enum",
        enumValues: ["electronics", "clothing", "food", "books", "home"],
      },
      { key: "price", label: "Price", type: "number" },
      { key: "stock", label: "Stock", type: "number" },
      { key: "rating", label: "Rating", type: "number" },
      { key: "inStock", label: "In Stock", type: "boolean" },
      { key: "createdAt", label: "Created At", type: "date" },
    ],
  },
]

export function getSchema(id: string): Schema | undefined {
  return SCHEMAS.find((s) => s.id === id)
}

export function getField(schemaId: string, fieldKey: string) {
  return getSchema(schemaId)?.fields.find((f) => f.key === fieldKey)
}
