import {
  Column,
  Entity,
  ForeignKey,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { QuestCategory } from "./QuestCategory.js";
import { Quest } from "./Quest.js";
import { User } from "./User.js";

@Entity()
export class Campaign {
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

  @ManyToOne(() => User, (user) => user.masterCampaigns)
  master!: User;

  @ManyToMany(() => User)
  @JoinTable()
  players!: User[];

  @OneToMany(() => QuestCategory, (category) => category.campaign, {
    onDelete: "CASCADE",
  })
  questCategories!: QuestCategory[];

  @OneToMany(() => Quest, (quest) => quest.campaign, {
    onDelete: "CASCADE",
  })
  quests!: Quest[];

  // createdAt:
  // updatedAt:
}
