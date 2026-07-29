import { Column, Entity, ManyToOne, PrimaryColumn } from "typeorm";
import { Campaign } from "./Campaign.js";
import type { WidgetType } from "../schemas/widget.schema.js";

@Entity()
export class Widget {
  @PrimaryColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 50 })
  type!: WidgetType;

  // position and size
  @Column({ type: "int" })
  x!: number;

  @Column({ type: "int" })
  y!: number;

  @Column({ type: "int" })
  w!: number;

  @Column({ type: "int" })
  h!: number;

  @Column({ type: "int", default: 1 })
  zIndex!: number;

  // flexible structure of a content (example: simple text: string for Note, smth like fighters: object[], turn: number for Initiative etc.)
  @Column({ type: "jsonb", default: {} })
  content!: object | null;

  @ManyToOne(() => Campaign, (campaign) => campaign.widgets, {
    onDelete: "CASCADE",
  })
  campaign!: Campaign;
}
