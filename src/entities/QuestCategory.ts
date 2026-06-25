import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Quest } from "./Quest.js";
import { Campaign } from "./Campaign.js";

@Entity()
export class QuestCategory {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({
    length: 100,
    type: "varchar",
  })
  title!: string;

  @Column({ default: 0, type: "numeric" })
  order!: number;

  @OneToMany(() => Quest, (quest) => quest.category)
  quests!: Quest[];

  @ManyToOne(() => Campaign, (campaign) => campaign.questCategories)
  campaign!: Campaign[];
}
