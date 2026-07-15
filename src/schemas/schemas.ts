import z from "zod";

export const TiptapContentSchema = z.looseObject({
  type: z.literal("doc"),
  // simple validation, can impove with definite union schema for every possible content but IMHO too much work it'll suffice
  content: z.array(z.any()).optional(),
});
