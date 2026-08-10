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
// (these code there just for schemas consistency between frontend and backend since backend doesn't actually use them, think about it later too)
// +++ think how to use one definite password validation type everywhere
// PASSWORD RESET (heavily review with other types, maybe somehow connect those with normal user types, especially reset password schema and form type)

export const ForgotPasswordSchema = z.object({
  email: z.email("Введіть коректну електронну пошту"),
});

export type ForgotPasswordDTO = z.infer<typeof ForgotPasswordSchema>;

// CHANGE revisit user types and schemas in general (+ I clearly remember some "change to proper user payload types" in some requests)
export interface ResetPasswordPayload {
  token: string;
  newPassword: string;
}

// CHANGE password validation schema to proper one (spec character number etc.)
export const resetPasswordSchema = z
  .object({
    newPassword: z.string().min(6, "Пароль має містити мінімум 6 символів"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Паролі не збігаються",
    path: ["confirmPassword"],
  });

export type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;
