import { relations } from 'drizzle-orm'
import { integer, pgTable, primaryKey, text } from 'drizzle-orm/pg-core'
import { orders, products } from '.'

export const orderItems = pgTable(
  'order_items',
  {
    orderId: text('order_id')
      .notNull()
      .references(() => orders.id),
    productId: text('product_id')
      .notNull()
      .references(() => products.id),
    quantity: integer('quantity').default(1),
    priceInCents: integer('price_in_cents').notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.orderId, table.productId] }),
  }),
)

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}))
