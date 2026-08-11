import { AppDataSource } from "../data-source.js";
import { Campaign } from "../entities/Campaign.js";
import { CampaignMember } from "../entities/CampaignMember.js";
import { User } from "../entities/User.js";
import NotFoundError from "../exceptions/not-found.js";
import UnauthorizedError from "../exceptions/unauthorized.js";
import {
  mapCampaignContextDTO,
  mapCampaignPreview,
} from "../mappers/campaign-mapper.js";
import type {
  CampaignRole,
  CreateCampaignDTO,
  UpdateCampaignDTO,
} from "../schemas/campaign.schema.js";
import CloudinaryStorageService from "./storage-service.js";

// HEAVILY REVIEW/TODO: some of functions uses old data shape with masterUsername instead of master and player objects
// it's not necessary bad since in this places we probably doesn't need party info and master info (more than username), BUT still data inconsistency
// should either somehow separate and type it as 2 different return shapes or think how to rewrite this properly in other way
// especially since create/update logic had changed and we doesn't need full info on creating/updating
// also review and CHANGE schemas/dto later

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
const memberRepository = AppDataSource.getRepository(CampaignMember);

const campaignService = {
  // CHANGE campaignDTO
  // also heavily REVIEW all this logic since on front-end we're creating campaign by setting a title only and then updating all other fields
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
    });

    const savedCampaign = await campaignRepository.save(newCampaign);

    return mapCampaignContextDTO(savedCampaign, "master");
  },

  updateCampaign: async function (
    campaignId: string,
    campaignData: UpdateCampaignDTO,
  ) {
    const campaign = await campaignRepository.findOne({
      where: { id: campaignId },
      relations: { master: true, members: { user: true } },
    });

    if (!campaign)
      throw new NotFoundError("Campaign with this id is not found");

    if (campaignData.title !== undefined) campaign.title = campaignData.title;
    if (campaignData.imageUrl !== undefined)
      campaign.imageUrl = campaignData.imageUrl;
    if (campaignData.content !== undefined)
      campaign.content = campaignData.content;

    const updatedCampaign = await campaignRepository.save(campaign);

    return mapCampaignContextDTO(updatedCampaign, "master");
  },

  updateCampaignContent: async function (
    campaignId: string,
    campaignData: UpdateCampaignDTO,
  ) {
    const campaign = await campaignRepository.findOne({
      where: { id: campaignId },
    });

    if (!campaign)
      throw new NotFoundError("Campaign with this id is not found");
    if (campaignData.content !== undefined)
      campaign.content = campaignData.content;

    const updatedCampaign = await campaignRepository.save(campaign);

    console.log(updatedCampaign.content);

    return {
      data: {
        id: updatedCampaign.id,
        content: updatedCampaign.content,
      },
    };
  },

  deleteCampaign: async function (campaignId: string) {
    const campaign = await campaignRepository.findOneBy({ id: campaignId });
    if (!campaign)
      throw new NotFoundError("Campaign with this id is not found");

    await campaignRepository.delete(campaignId);

    const campaignTag = `campaign_${campaignId}`;
    const campaignFolderPath = `campaigns/${campaignId}`;
    // REVIEW test if folder deletion really works
    // won't execute if campaign deletion didn't work
    // will delete quests categories etc because of onDelete: cascade in entity relations
    try {
      await CloudinaryStorageService.deleteByTag(campaignTag);
      await CloudinaryStorageService.deleteFolder(campaignFolderPath);
    } catch (error) {
      console.error("Error while deleting campaign resources: ", error);
    }
  },

  getUserPlayerCampaigns: async function (userId: string) {
    const campaigns = await campaignRepository.find({
      where: { members: { userId } },
      relations: { master: true },
      select: {
        id: true,
        title: true,
        imageUrl: true,
        master: { id: true, username: true },
        createdAt: true,
        updatedAt: true,
      },
      order: { updatedAt: "DESC" },
    });

    return campaigns.map((campaign) => mapCampaignPreview(campaign, "player"));
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
        createdAt: true,
        updatedAt: true,
      },
      order: { updatedAt: "DESC" },
    });

    return campaigns.map((campaign) => mapCampaignPreview(campaign, "master"));
  },

  getUserAllCampaigns: async function (userId: string) {
    const campaigns = await campaignRepository.find({
      where: [{ master: { id: userId } }, { members: { userId } }],
      relations: { master: true },
      select: {
        id: true,
        title: true,
        imageUrl: true,
        master: { id: true, username: true },
        createdAt: true,
        updatedAt: true,
      },
      order: { updatedAt: "DESC" },
    });

    return campaigns.map((campaign) =>
      mapCampaignPreview(
        campaign,
        campaign.master.id === userId ? "master" : "player",
      ),
    );
  },

  // REVIEW if anytime will think about implementing other roles (co-DM etc, then should modify join table and work with it instead)
  getUserRole: async function (userId: string, campaignId: string) {
    const isMaster = await campaignRepository.exists({
      where: { id: campaignId, master: { id: userId } },
    });

    if (isMaster) return "master";

    const isPlayer = await memberRepository.exists({
      where: { campaignId, userId },
    });

    if (isPlayer) return "player";

    throw new UnauthorizedError(
      "You are not authorized to interact with this campaign",
    );
  },

  getCampaignContext: async function (campaignId: string, role: CampaignRole) {
    const campaign = await campaignRepository.findOne({
      where: { id: campaignId },
      relations: { master: true, members: { user: true } },
      select: {
        id: true,
        title: true,
        imageUrl: true,
        master: { id: true, username: true, profile: true },
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!campaign)
      throw new NotFoundError("Campaign with this id is not found");

    return mapCampaignContextDTO(campaign, role);
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
