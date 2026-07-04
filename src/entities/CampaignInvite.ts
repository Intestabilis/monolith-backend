import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Campaign } from "./Campaign.js";

@Entity("campaign_invites")
export class CampaignInvite {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", unique: true })
  token!: string; // idk maybe should name it link for better clarity, but I like token more

  @Column("uuid")
  campaignId!: string;

  @Column({ type: "timestamp" })
  expiresAt!: Date;

  @CreateDateColumn({ type: "timestamp" })
  createdAt!: Date;

  @ManyToOne(() => Campaign, { onDelete: "CASCADE" })
  @JoinColumn({ name: "campaignId" })
  campaign!: Campaign;
}
