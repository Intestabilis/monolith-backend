import z from "zod";
import { CampaignMemberSchema } from "./user.schema.js";

const TiptapContentSchema = z.object({
  type: z.literal("doc"),
  // simple validation, can impove with definite union schema for every possible content but IMHO too much work it'll suffice
  content: z.array(z.object()).optional(),
});

export const CampaignRoleSchema = z.enum(["master", "player"]);
export type CampaignRole = z.infer<typeof CampaignRoleSchema>;

export const CampaignPreviewSchema = z.object({
  id: z.string(),
  title: z.string(),
  masterUsername: z.string(),
  imageUrl: z.string().nullable().optional(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});
export type CampaignPreview = z.infer<typeof CampaignPreviewSchema>;

export const PermissionsSchema = z.object({
  canEditLore: z.boolean(),
  canInvitePlayers: z.boolean(),
  // add new permissions etc, maybe rethink this with some config permissions depends on user role
});

export const CampaignContextMetaSchema = z.object({
  userRole: CampaignRoleSchema,
  permissions: PermissionsSchema,
});

// DTOs
export const CampaignListResponseSchema = z.array(
  z.object({
    data: CampaignPreviewSchema,
    meta: z.object({ userRole: CampaignRoleSchema }),
  }),
);
export type CampaignListResponse = z.infer<typeof CampaignListResponseSchema>;

export const CampaignContextResponseSchema = z.object({
  data: CampaignPreviewSchema.extend({
    members: z.array(CampaignMemberSchema).default([]),
    master: CampaignMemberSchema.omit({ joinedAt: true }),
  }),
  meta: CampaignContextMetaSchema,
});
export type CampaignContextResponse = z.infer<
  typeof CampaignContextResponseSchema
>;

export const CampaignContentResponseSchema = z.object({
  data: z.object({
    id: z.string(),
    content: TiptapContentSchema.nullable().optional(), // Tiptap JSON
  }),
});
export type CampaignContentResponse = z.infer<
  typeof CampaignContentResponseSchema
>;

export const CreateCampaignSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title is too long"),
  imageUrl: z.string().url("Invalid image URL").nullable().optional(),
  content: TiptapContentSchema.nullable().optional(),
});
export type CreateCampaignDTO = z.infer<typeof CreateCampaignSchema>;

export const UpdateCampaignSchema = CreateCampaignSchema.partial();
export type UpdateCampaignDTO = z.infer<typeof UpdateCampaignSchema>;
