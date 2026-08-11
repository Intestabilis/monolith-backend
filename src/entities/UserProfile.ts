import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from "typeorm";
import { User } from "./User.js";

@Entity()
export class UserProfile {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", nullable: true })
  avatarUrl!: string | null;

  @Column({ type: "text", nullable: true })
  bio!: string | null;

  @Column({ type: "varchar", length: 50, nullable: true })
  pronouns!: string | null;

  @Column({ type: "varchar", length: 100, nullable: true })
  timezone!: string | null;

  @Column({ type: "text", array: true, nullable: true })
  favoriteSystems!: string[] | null;

  @Column({ type: "text", array: true, nullable: true })
  playstyles!: string[] | null;

  @OneToOne(() => User, (user) => user.profile, { onDelete: "CASCADE" })
  @JoinColumn()
  user!: User;
}
