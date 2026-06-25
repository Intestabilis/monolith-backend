import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "./User.js";

@Entity()
export class Token {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar" })
  refreshToken!: string;

  @OneToOne(() => User)
  @JoinColumn()
  user!: User;
}
