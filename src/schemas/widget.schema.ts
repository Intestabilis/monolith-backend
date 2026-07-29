import z from "zod";

// widget types
export const WIDGET_TYPES = [
  "NOTE",
  "INITIATIVE",
  // "CALENDAR",
  // "DICE_ROLLER",
] as const;

// Specific widgets content types
export const NoteContentSchema = z.object({
  text: z.string().optional().default(""),
});

export const CombatantSchema = z.object({
  id: z.uuid(),
  name: z.string().min(1, "Ім'я не може бути порожнім"),
  initiative: z.number().int("Ініціатива має бути цілим числом"),
});

export const InitiativeContentSchema = z.object({
  // combatants: z.array(CombatantSchema).default([]),
  // currentTurn: z.number().int().min(0).default(0),
});

// General widget content schema (for basic validation before specific validation in service)
const BaseContentSchema = z.record(z.string(), z.any());

// REQUESTS
export const createWidgetSchema = z.object({
  id: z.uuid(), // generated on front-end
  type: z.enum(WIDGET_TYPES),
  x: z.number().int(),
  y: z.number().int(),
  w: z.number().int().min(100),
  h: z.number().int().min(100),
  zIndex: z.number().int().min(0),
  content: BaseContentSchema,
});

// REVIEW maybe create some basic widget schema and use it in create/update layout
export const updateWidgetsLayoutSchema = z.object({
  widgets: z
    .array(
      z.object({
        id: z.uuid(),
        x: z.number().int(),
        y: z.number().int(),
        w: z.number().int(),
        h: z.number().int(),
        zIndex: z.number().int(),
      }),
    )
    .min(1, "Масив віджетів не може бути порожнім"),
});

export const updateWidgetContentSchema = z.object({
  content: BaseContentSchema,
});

// TYPES

export type WidgetType = (typeof WIDGET_TYPES)[number];

export type NoteContentDTO = z.infer<typeof NoteContentSchema>;
export type InitiativeContentDTO = z.infer<typeof InitiativeContentSchema>;

export type WidgetContentDTO =
  | NoteContentDTO
  | InitiativeContentDTO
  | Record<string, any>;

export type CreateWidgetDTO = z.infer<typeof createWidgetSchema>;
export type UpdateWidgetsLayoutDTO = z.infer<typeof updateWidgetsLayoutSchema>;
export type UpdateWidgetContentDTO = z.infer<typeof updateWidgetContentSchema>;

// Response
export const widgetResponseSchema = z.object({
  id: z.uuid(),
  type: z.enum(WIDGET_TYPES),
  x: z.number().int(),
  y: z.number().int(),
  w: z.number().int(),
  h: z.number().int(),
  zIndex: z.number().int(),
  content: BaseContentSchema,
  campaignId: z.uuid(),
});

export type WidgetResponseDTO = z.infer<typeof widgetResponseSchema>;
