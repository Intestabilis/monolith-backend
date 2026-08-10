import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from "typeorm";
import { User } from "./User.js";

@Entity()
export class UserSecrets {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", nullable: true })
  activationLink!: string | null;

  @Column({ type: "timestamp", nullable: true })
  activationExpires!: Date | null;

  @Column({ type: "varchar", nullable: true })
  resetPasswordToken!: string | null;

  @Column({ type: "timestamp", nullable: true })
  resetPasswordExpires!: Date | null;

  @OneToOne(() => User, (user) => user.secrets, { onDelete: "CASCADE" })
  @JoinColumn()
  user!: User;
}
