import {
  Column,
  Entity,
  ManyToMany,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Campaign } from "./Campaign.js";
import { Token } from "./Token.js";
import { CampaignMember } from "./CampaignMember.js";
import { UserSecrets } from "./UserSecrets.js";

@Entity()
export class User {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ unique: true, type: "varchar" })
  email!: string;

  @Column({ unique: true, type: "varchar" })
  username!: string;

  @Column({ type: "varchar", nullable: true })
  avatarUrl?: string | null;

  @Column({ type: "varchar" })
  passwordHash!: string;

  @Column({ default: false, type: "bool" })
  isActivated!: boolean;

  @OneToMany(() => Campaign, (campaign) => campaign.master, {
    onDelete: "CASCADE",
  })
  masterCampaigns!: Campaign[];

  @OneToMany(() => CampaignMember, (member) => member.user, {
    cascade: true,
  })
  playerCampaigns!: CampaignMember[];

  @OneToOne(() => Token, (token) => token.user)
  token!: Token;

  @OneToOne(() => UserSecrets, (secrets) => secrets.user, {
    cascade: true,
    nullable: true,
    onDelete: "CASCADE",
  })
  secrets!: UserSecrets;
}
