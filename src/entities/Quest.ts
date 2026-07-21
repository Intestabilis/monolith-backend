import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { QuestCategory } from "./QuestCategory.js";
import { Campaign } from "./Campaign.js";

@Entity()
export class Quest {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({
    length: 100,
    type: "varchar",
  })
  title!: string;
  // JSONB Content from tiptap, maybe will somehow define more properly later
  @Column({ type: "jsonb", nullable: true })
  content!: object;

  // maybe change to custom literal type
  @Column({ nullable: true, type: "varchar" })
  status!: string | null;

  @Column({ nullable: true, type: "varchar" })
  source!: string | null;

  @Column({ default: 0, type: "numeric" })
  order!: number;

  @CreateDateColumn({ type: "timestamp with time zone" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamp with time zone" })
  updatedAt!: Date;

  // category is optional
  @ManyToOne(() => QuestCategory, (category) => category.quests, {
    nullable: true,
    onDelete: "CASCADE",
  })
  category!: QuestCategory | null;

  @ManyToOne(() => Campaign, (campaign) => campaign.quests)
  campaign!: Campaign;
}
