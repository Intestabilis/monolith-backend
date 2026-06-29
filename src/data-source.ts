import { DataSource } from "typeorm";
import { Campaign } from "./entities/Campaign.js";
import { QuestCategory } from "./entities/QuestCategory.js";
import { Quest } from "./entities/Quest.js";
import { User } from "./entities/User.js";
import { Token } from "./entities/Token.js";

export const AppDataSource = new DataSource({
  // REVIEW type manipulations + delete hardcoded options before prod
  type: (process.env.DATABASE_TYPE as any) || "postgres",
  host: process.env.DATABASE_HOST || "localhost",
  port: +process.env.DATABASE_PORT! || 5432,
  username: process.env.DATABASE_USER || "postgres",
  password: process.env.DATABASE_PASSWORD || "admin",
  database: process.env.DATABASE_NAME! || "Monolith",
  synchronize: true,
  // logging: true,
  logging: false,
  entities: [User, Token, Campaign, QuestCategory, Quest],
  migrations: [],
});
