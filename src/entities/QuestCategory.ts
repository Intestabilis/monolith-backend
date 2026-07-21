import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
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

  @CreateDateColumn({ type: "timestamp with time zone" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamp with time zone" })
  updatedAt!: Date;

  @OneToMany(() => Quest, (quest) => quest.category, { onDelete: "CASCADE" })
  quests!: Quest[];

  @ManyToOne(() => Campaign, (campaign) => campaign.questCategories)
  campaign!: Campaign;
}
