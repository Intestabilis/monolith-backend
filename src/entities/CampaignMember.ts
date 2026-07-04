import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from "typeorm";
import { User } from "./User.js";
import { Campaign } from "./Campaign.js";

@Entity("campaign_members")
@Unique(["campaignId", "userId"]) // one user can't join specific campaign two times (in the matter of table rows not logic since DM can delete and then reinvite them)
export class CampaignMember {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column("uuid")
  campaignId!: string;

  @Column("uuid")
  userId!: string;

  @CreateDateColumn({ type: "timestamp" })
  joinedAt!: Date;

  @ManyToOne(() => Campaign, (campaign) => campaign.members, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "campaignId" })
  campaign!: Campaign;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user!: User;

  // characterId
  // charaters[] ??? idk maybe should do like this if want to do multi-character functionality in the future (for example for Shadowdark campaigns)
}
