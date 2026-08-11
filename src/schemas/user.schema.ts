import z from "zod";

// CHANGE password validation schema to proper one (spec character number etc.)
const PasswordSchema = z
  .string()
  .min(6, "Пароль має містити мінімум 6 символів")
  .max(32, "Пароль занадто довгий");

export const CreateUserSchema = z.object({
  email: z.email(),
  username: z.string().min(6).max(20),
  password: PasswordSchema,
  isActivated: z.boolean().default(false),
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

export const UpdateProfileSchema = z.object({
  bio: z.string().max(2000, "Опис занадто довгий").nullable().optional(),
  pronouns: z.string().max(50, "Занадто довго").nullable().optional(),
  timezone: z.string().max(100).nullable().optional(),
  favoriteSystems: z.array(z.string()).nullable().optional(),
  playstyles: z.array(z.string()).nullable().optional(),
});

export type UpdateProfileDTO = z.infer<typeof UpdateProfileSchema>;

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

export const CampaignMemberSchema = z.object({
  id: z.uuid(),
  username: z.string(),
  joinedAt: z.iso.datetime(),

  avatarUrl: z.string().nullable().optional(),
  pronouns: z.string().nullable().optional(),

  // characterName: z.string().nullable().optional(),
});

export type CampaignMemberDTO = z.infer<typeof CampaignMemberSchema>;

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

export const resetPasswordSchema = z
  .object({
    newPassword: PasswordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Паролі не збігаються",
    path: ["confirmPassword"],
  });

export type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;
