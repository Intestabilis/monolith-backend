import { Campaign } from "../entities/Campaign.js";
import { CampaignMember } from "../entities/CampaignMember.js";
import { User } from "../entities/User.js";
import type { CampaignRole } from "../schemas/campaign.schema.js";

// Public profile mapper
export function mapPublicProfile(user: User) {
  return {
    id: user.id,
    username: user.username,
    avatarUrl: user.profile?.avatarUrl || null,
    pronouns: user.profile?.pronouns || null,
  };
}

// Campaign member mapper
export function mapCampaignMember(member: CampaignMember) {
  return {
    ...mapPublicProfile(member.user),
    joinedAt: member.joinedAt.toISOString(),
  };
}

// Campaign Context Mapper (getContext, updateCampaign)
export function mapCampaignContextDTO(campaign: Campaign, role: CampaignRole) {
  return {
    data: {
      id: campaign.id,
      title: campaign.title,
      imageUrl: campaign.imageUrl || null,
      master: mapPublicProfile(campaign.master),
      members: (campaign.members || []).map(mapCampaignMember),
      createdAt: campaign.createdAt.toISOString(),
      updatedAt: campaign.updatedAt.toISOString(),
    },
    meta: {
      userRole: role,
      permissions: {
        canEditLore: role === "master",
        canInvitePlayers: role === "master",
      },
    },
  };
}

// Campaign Preview mapper
export function mapCampaignPreview(campaign: Campaign, role: CampaignRole) {
  return {
    data: {
      id: campaign.id,
      title: campaign.title,
      imageUrl: campaign.imageUrl || null,
      masterUsername: campaign.master.username,
      createdAt: campaign.createdAt.toISOString(),
      updatedAt: campaign.updatedAt.toISOString(),
    },
    meta: {
      userRole: role,
    },
  };
}
