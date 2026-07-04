import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { QuestCategory } from "./QuestCategory.js";
import { Quest } from "./Quest.js";
import { User } from "./User.js";
import { CampaignMember } from "./CampaignMember.js";
import { CampaignInvite } from "./CampaignInvite.js";

@Entity()
export class Campaign {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({
    length: 100,
    type: "varchar",
  })
  title!: string;

  @Column({ type: "varchar", nullable: true })
  imageUrl?: string | null;

  // JSONB Content from tiptap, maybe will somehow define more properly later
  @Column({ type: "jsonb", nullable: true })
  content?: object | null;

  @ManyToOne(() => User, (user) => user.masterCampaigns)
  master!: User;

  @OneToMany(() => CampaignMember, (member) => member.campaign, {
    cascade: true,
  })
  members!: CampaignMember[];

  @OneToMany(() => CampaignInvite, (invite) => invite.campaign, {
    onDelete: "CASCADE",
  })
  invites!: CampaignInvite[];

  @OneToMany(() => QuestCategory, (category) => category.campaign, {
    onDelete: "CASCADE",
  })
  questCategories!: QuestCategory[];

  @OneToMany(() => Quest, (quest) => quest.campaign, {
    onDelete: "CASCADE",
  })
  quests!: Quest[];

  @CreateDateColumn({ type: "timestamp with time zone" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamp with time zone" })
  updatedAt!: Date;
}
