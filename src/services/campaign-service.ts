import { AppDataSource } from "../data-source.js";
import { Campaign } from "../entities/Campaign.js";
import { User } from "../entities/User.js";
import NotFoundError from "../exceptions/not-found.js";
import UnauthorizedError from "../exceptions/unauthorized.js";
import type {
  CampaignRole,
  CreateCampaignDTO,
  UpdateCampaignDTO,
} from "../schemas/campaign.schema.js";

// REVIEW - Google said that Tiptap might crash with getting null in the content, so there default Tiptap content to use if content on campaign creation
// is non-existent (and it probably will be)
const DEFAULT_TIPTAP_CONTENT = {
  type: "doc",
  content: [
    {
      type: "paragraph",
    },
  ],
};

const campaignRepository = AppDataSource.getRepository(Campaign);
const userRepository = AppDataSource.getRepository(User);

const campaignService = {
  // CHANGE campaignDTO
  createCampaign: async function (
    userId: string,
    campaignData: CreateCampaignDTO,
  ) {
    const user = await userRepository.findOneBy({ id: userId });
    if (!user) throw new NotFoundError("User with this id is not found");

    const newCampaign = await campaignRepository.create({
      title: campaignData.title,
      imageUrl: campaignData.imageUrl || null,
      content: campaignData.content || DEFAULT_TIPTAP_CONTENT,
      master: user,
      players: [],
    });

    const savedCampaign = await campaignRepository.save(newCampaign);

    return {
      data: {
        id: savedCampaign.id,
        title: savedCampaign.title,
        imageUrl: savedCampaign.imageUrl,
        masterName: user.username,
      },
      meta: {
        userRole: "master",
        permissions: { canEditLore: true, canInvitePlayers: true },
      },
    };
  },

  updateCampaign: async function (
    campaignId: string,
    campaignData: UpdateCampaignDTO,
  ) {
    const campaign = await campaignRepository.findOne({
      where: { id: campaignId },
      relations: { master: true },
    });

    if (!campaign)
      throw new NotFoundError("Campaign with this id is not found");

    if (campaignData.title !== undefined) campaign.title = campaignData.title;
    if (campaignData.imageUrl !== undefined)
      campaign.imageUrl = campaignData.imageUrl;
    if (campaignData.content !== undefined)
      campaign.content = campaignData.content;

    const updatedCampaign = await campaignRepository.save(campaign);

    return {
      data: {
        id: updatedCampaign.id,
        title: updatedCampaign.title,
        imageUrl: updatedCampaign.imageUrl,
        masterName: updatedCampaign.master.username,
      },
      meta: {
        userRole: "master",
        permissions: { canEditLore: true, canInvitePlayers: true },
      },
    };
  },

  deleteCampaign: async function (campaignId: string) {
    const campaign = await campaignRepository.findOneBy({ id: campaignId });
    if (!campaign)
      throw new NotFoundError("Campaign with this id is not found");
    // will delete quests categories etc because of onDelete: cascade in entity relations
    await campaignRepository.remove(campaign);
  },

  getUserPlayerCampaigns: async function (userId: string) {
    const campaigns = await campaignRepository.find({
      where: { players: { id: userId } },
      relations: { master: true },
      select: {
        id: true,
        title: true,
        imageUrl: true,
        master: { id: true, username: true },
      },
      order: { id: "DESC" },
    });

    return campaigns.map((campaign) => ({
      data: {
        id: campaign.id,
        title: campaign.title,
        imageUrl: campaign.imageUrl,
        masterName: campaign.master.username,
      },
      meta: {
        userRole: "player",
      },
    }));
  },

  getUserMasterCampaigns: async function (userId: string) {
    const campaigns = await campaignRepository.find({
      where: { master: { id: userId } },
      relations: { master: true },
      select: {
        id: true,
        title: true,
        imageUrl: true,
        master: { id: true, username: true },
      },
      order: { id: "DESC" },
    });

    return campaigns.map((campaign) => ({
      data: {
        id: campaign.id,
        title: campaign.title,
        imageUrl: campaign.imageUrl,
        masterName: campaign.master.username,
      },
      meta: {
        userRole: "master",
      },
    }));
  },

  getUserAllCampaigns: async function (userId: string) {
    const campaigns = await campaignRepository.find({
      where: [{ master: { id: userId } }, { players: { id: userId } }],
      relations: { master: true },
      select: {
        id: true,
        title: true,
        imageUrl: true,
        master: { id: true, username: true },
      },
      order: { id: "DESC" },
    });

    return campaigns.map((campaign) => ({
      data: {
        id: campaign.id,
        title: campaign.title,
        imageUrl: campaign.imageUrl,
        masterName: campaign.master.username,
      },
      meta: {
        userRole: campaign.master.id === userId ? "master" : "player",
      },
    }));
  },

  // REVIEW if anytime will think about implementing other roles (co-DM etc, then should modify join table and work with it instead)
  getUserRole: async function (userId: string, campaignId: string) {
    const campaign = await campaignRepository.findOne({
      where: [
        { id: campaignId, master: { id: userId } },
        { id: campaignId, players: { id: userId } },
      ],
      select: {
        id: true,
        master: {
          id: true, // to check if master
        },
      },
      relations: {
        master: true,
      },
    });

    if (!campaign) {
      throw new UnauthorizedError(
        "You are not authorized to interact with this campaign",
      );
    }

    return campaign.master.id === userId ? "master" : "player";
  },

  getCampaignContext: async function (campaignId: string, role: CampaignRole) {
    const campaign = await campaignRepository.findOne({
      where: { id: campaignId },
      relations: { master: true },
      select: {
        id: true,
        title: true,
        imageUrl: true,
        master: { id: true, username: true },
      },
    });

    if (!campaign)
      throw new NotFoundError("Campaign with this id is not found");

    return {
      data: {
        id: campaign.id,
        title: campaign.title,
        imageUrl: campaign.imageUrl,
        masterName: campaign.master.username,
      },
      meta: {
        userRole: role,
        permissions: {
          canEditLore: role === "master",
          canInvitePlayers: role === "master",
        },
      },
    };
  },

  getCampaignContent: async function (campaignId: string) {
    const campaign = await campaignRepository.findOne({
      where: { id: campaignId },
      select: { id: true, content: true },
    });

    if (!campaign)
      throw new NotFoundError("Campaign with this id is not found");

    return {
      data: {
        id: campaign.id,
        content: campaign.content,
      },
    };
  },
};

export default campaignService;
