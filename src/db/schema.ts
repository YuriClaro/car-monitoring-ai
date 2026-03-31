import {
  check,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const carsTable = pgTable('cars', {
  id: uuid('id').defaultRandom().primaryKey(),
  brand: text('brand').notNull(),
  model: text('model').notNull(),
  year: integer('year').notNull(),
  mileage: integer('mileage').notNull(),
  notes: text('notes'),
  photoPath: text('photo_path'),
});

export const chatConversationsTable = pgTable(
  'chat_conversations',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    title: text('title'),
    ownerKey: text('owner_key'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('chat_conversations_owner_key_idx').on(table.ownerKey)],
);

export const chatMessagesTable = pgTable(
  'chat_messages',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    conversationId: uuid('conversation_id')
      .notNull()
      .references(() => chatConversationsTable.id, { onDelete: 'cascade' }),
    role: text('role').$type<'user' | 'assistant'>().notNull(),
    content: text('content').notNull(),
    imageDataUrls: jsonb('image_data_urls').$type<string[] | null>(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    check('chat_messages_role_check', sql`${table.role} in ('user', 'assistant')`),
    index('idx_chat_messages_conversation_created_at').on(
      table.conversationId,
      table.createdAt,
    ),
  ],
);

export type InsertCar = typeof carsTable.$inferInsert;
export type SelectCar = typeof carsTable.$inferSelect;

export type InsertChatConversation = typeof chatConversationsTable.$inferInsert;
export type SelectChatConversation = typeof chatConversationsTable.$inferSelect;

export type InsertChatMessage = typeof chatMessagesTable.$inferInsert;
export type SelectChatMessage = typeof chatMessagesTable.$inferSelect;
