import { AppDataSource } from "../data-source.js";
import { Campaign } from "../entities/Campaign.js";
import { CampaignInvite } from "../entities/CampaignInvite.js";
import { CampaignMember } from "../entities/CampaignMember.js";
import { v4 as uuidv4 } from "uuid";
import NotFoundError from "../exceptions/not-found.js";
import BadRequestError from "../exceptions/bad-request.js";

const inviteRepository = AppDataSource.getRepository(CampaignInvite);
const memberRepository = AppDataSource.getRepository(CampaignMember);

type inviteDuration = "7d" | "30d";

const partyService = {
  generateInvite: async function (
    campaignId: string,
    duration: inviteDuration,
  ) {
    const expiresAt = new Date();
    if (duration === "7d") expiresAt.setDate(expiresAt.getDate() + 7);
    if (duration === "30d") expiresAt.setDate(expiresAt.getDate() + 30);
    const token = uuidv4();

    const invite = inviteRepository.create({
      campaignId,
      token,
      expiresAt,
    });

    await inviteRepository.save(invite);
    return token;
  },

  joinCampaign: async function (inviteToken: string, userId: string) {
    const invite = await inviteRepository.findOne({
      where: { token: inviteToken },
      relations: { campaign: { master: true } },
    });

    if (!invite) {
      throw new NotFoundError("Invite link is not valid or does not exist");
    }

    if (new Date() > invite.expiresAt) {
      // REVIEW Deleting expired tokens there, but maybe add some worker too in the future
      await inviteRepository.delete({ token: inviteToken });
      throw new BadRequestError("Invite link is expired");
    }

    const campaignId = invite.campaignId;

    if (invite.campaign.master.id === userId) {
      // REVIEW think about it more, make sense because we don't want to add DM to members list, but maybe should
      // do refactor in the future and use member list for a role too
      throw new BadRequestError("You are already an owner of this campaign");
    }

    const existingMember = await memberRepository.findOne({
      where: { campaignId, userId },
    });

    if (existingMember) {
      return campaignId;
    }

    const newMember = memberRepository.create({ campaignId, userId });
    await memberRepository.save(newMember);

    return campaignId;
  },

  removeMember: async function (campaignId: string, userIdToRemove: string) {
    await memberRepository.delete({
      campaignId,
      userId: userIdToRemove,
    });

    // idkk if we should do it, probably yes but still make little sense
    // if (result.affected === 0) {
    //   throw new NotFoundError("There is no such player in this campaign");
    // }
  },

  getPartyMembers: async function (campaignId: string) {
    // getting all users
    const members = await memberRepository.find({
      where: { campaignId },
      relations: { user: true },
      order: { joinedAt: "ASC" },
    });

    return members.map((member) => ({
      id: member.user.id,
      username: member.user.username,
      avatarUrl: member.user.avatarUrl,
      joinedAt: member.joinedAt.toISOString(),
    }));
  },
};

export default partyService;
