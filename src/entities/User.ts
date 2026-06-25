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

@Entity()
export class User {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ unique: true, type: "varchar" })
  email!: string;

  @Column({ unique: true, type: "varchar" })
  username!: string;

  @Column({ type: "varchar" })
  passwordHash!: string;

  @Column({ default: false, type: "bool" })
  isActivated!: boolean;

  @Column({ type: "varchar" })
  activationLink!: string;

  @OneToMany(() => Campaign, (campaign) => campaign.master, {
    onDelete: "CASCADE",
  })
  masterCampaigns!: Campaign[];

  @ManyToMany(() => Campaign, (campaign) => campaign.players)
  playerCampaigns!: Campaign[];

  @OneToOne(() => Token, (token) => token.user)
  token!: Token;
}
