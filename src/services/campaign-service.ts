import { AppDataSource } from "../data-source.js";
import { Campaign } from "../entities/Campaign.js";
import NotFoundError from "../exceptions/not-found.js";
import UnauthorizedError from "../exceptions/unauthorized.js";
import type { CampaignRole } from "../schemas/campaign.schema.js";

const campaignRepository = AppDataSource.getRepository(Campaign);

const campaignService = {
  // CHANGE campaignDTO
  createCampaign: async function (userId: string, campaignData: object) {},

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
