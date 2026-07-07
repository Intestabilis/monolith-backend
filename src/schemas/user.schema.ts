import z from "zod";

export const CreateUserSchema = z.object({
  email: z.email(),
  username: z.string().min(6).max(20),
  password: z.string().min(3).max(20),
  isActivated: z.boolean().default(false),
  avatarUrl: z.url().nullable().optional(),
});

export type CreateUserDTO = z.infer<typeof CreateUserSchema>;

export const UserTokenSchema = CreateUserSchema.omit({ password: true }).extend(
  { id: z.string() },
);

export type UserTokenDTO = z.infer<typeof UserTokenSchema>;

export const LoginUserSchema = CreateUserSchema.omit({
  isActivated: true,
  username: true,
});

export type LoginUserDTO = z.infer<typeof LoginUserSchema>;

/*
export const UserCampaignInfoSchema = z.object({
  id: z.string(),
  email: z.email(),
  username: z.string().min(6).max(20),
});
*/

export const UserCampaignInfoSchema = CreateUserSchema.omit({
  password: true,
  isActivated: true,
}).extend({ id: z.string() });

export type UserCampaignInfoDTO = z.infer<typeof UserCampaignInfoSchema>;

export const CampaignMemberSchema = UserCampaignInfoSchema.omit({
  email: true,
}).extend({
  joinedAt: z.iso.datetime(),
  // characterName: z.string().optional(),
  // characterClass: z.string().optional(),
});

export type CampaignMember = z.infer<typeof CampaignMemberSchema>;
