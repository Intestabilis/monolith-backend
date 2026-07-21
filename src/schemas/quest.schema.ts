import z from "zod";
import { TiptapContentSchema } from "./schemas.js";

// Quests

const QUEST_STATUSES = [
  "active",
  "in-progress",
  "failed",
  "completed",
] as const;

// type QuestStatus = (typeof QUEST_STATUSES)[number];

export const createQuestSchema = z.object({
  title: z.string().min(1, "Назва квесту не може бути порожньою"),
  status: z.enum(QUEST_STATUSES).nullable().optional(),
  source: z.string().nullable().optional(),
  content: TiptapContentSchema.nullable().optional(), // Дозволяємо контент при створенні
  categoryId: z.uuid("Невалідний ID категорії").nullable().optional(),
});

export const updateQuestSchema = z.object({
  title: z.string().min(1, "Назва не може бути порожньою").optional(),
  // CHANGE do type for statuses
  status: z.enum(QUEST_STATUSES).nullable().optional(),
  source: z.string().nullable().optional(),
  content: TiptapContentSchema,
  categoryId: z.uuid().nullable().optional(),
});

// Categories

export const createCategorySchema = z.object({
  title: z.string().min(1, "Назва категорії не може бути порожньою"),
});

export const updateCategorySchema = z.object({
  title: z.string().min(1, "Назва категорії не може бути порожньою").optional(),
});

// Order for drag and drop
export const reorderItemsSchema = z.object({
  items: z
    .array(
      z.object({
        id: z.uuid(),
        type: z.enum(["quest", "category"]),
        order: z.number(),
        categoryId: z.uuid().nullable().optional(),
      }),
    )
    .min(1, "Масив для сортування не може бути порожнім"),
});

export type CreateQuestDTO = z.infer<typeof createQuestSchema>;
export type UpdateQuestDTO = z.infer<typeof updateQuestSchema>;
export type CreateCategoryDTO = z.infer<typeof createCategorySchema>;
export type UpdateCategoryDTO = z.infer<typeof updateCategorySchema>;
export type ReorderItemsDTO = z.infer<typeof reorderItemsSchema>;

// Responses Complex DTOs
export interface QuestSidebarItemDTO {
  id: string;
  title: string;
  // probably should change to QuestStatus, but it's giving typescript error when returning from service (ig because string is not assignable to enum) and
  // it's anyway return DTO so validation this strict probably not that necessary
  status: string | null;
  order: number;
}

export interface QuestCategorySidebarDTO {
  id: string;
  title: string;
  order: number;
  quests: QuestSidebarItemDTO[];
}

export interface QuestSidebarResponseDTO {
  categories: QuestCategorySidebarDTO[];
  rootQuests: QuestSidebarItemDTO[];
}

export const questResponseSchema = z.object({
  id: z.uuid(),
  title: z.string(),
  content: TiptapContentSchema,
  status: z.string().nullable(),
  source: z.string().nullable(),
  order: z.number(),
  categoryId: z.uuid().nullable(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

export type QuestResponseDTO = z.infer<typeof questResponseSchema>;
