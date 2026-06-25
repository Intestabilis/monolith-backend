import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
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
  status!: string;

  @Column({ nullable: true, type: "varchar" })
  source!: string;

  @Column({ default: 0, type: "numeric" })
  order!: number;

  @ManyToOne(() => QuestCategory, (category) => category.quests)
  category!: QuestCategory;

  @ManyToOne(() => Campaign, (campaign) => campaign.quests)
  campaign!: Campaign[];
}
