import type { User } from "../entities/User.js";

export function mapUserProfileDTO(user: User) {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    isActivated: user.isActivated,

    // profile data
    avatarUrl: user.profile?.avatarUrl || null,
    bio: user.profile?.bio || null,
    pronouns: user.profile?.pronouns || null,
    timezone: user.profile?.timezone || null,
    favoriteSystems: user.profile?.favoriteSystems || [],
    playstyles: user.profile?.playstyles || [],
  };
}
