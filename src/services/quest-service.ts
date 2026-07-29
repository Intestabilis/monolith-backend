import { IsNull } from "typeorm";
import { AppDataSource } from "../data-source.js";
import { Quest } from "../entities/Quest.js";
import { QuestCategory } from "../entities/QuestCategory.js";
import type {
  CreateQuestDTO,
  QuestSidebarResponseDTO,
  ReorderItemsDTO,
  UpdateQuestDTO,
} from "../schemas/quest.schema.js";
import NotFoundError from "../exceptions/not-found.js";
import BadRequestError from "../exceptions/bad-request.js";

const questRepository = AppDataSource.getRepository(Quest);
const categoryRepository = AppDataSource.getRepository(QuestCategory);

// IMPORTANT REMINDER!
// use where: {campaign: {id: campaignId}}
// check for quest operations to verify that access was granted by correct campaign
// if we don't do that, someone may forge their role check with other campaign and use it to manipulate quests

const questService = {
  // placed it there because of root quests existance + quests are more "main entity" of this feature than categories
  // get sidebar data with categories and quest lazy loading
  getQuestTree: async function (
    campaignId: string,
  ): Promise<QuestSidebarResponseDTO> {
    // getting categories and nested quests
    const categories = await categoryRepository.find({
      where: { campaign: { id: campaignId } },
      relations: { quests: true },
      order: {
        order: "ASC",
        quests: { order: "ASC" },
      },
      select: {
        id: true,
        title: true,
        order: true,
        quests: {
          id: true,
          title: true,
          status: true,
          order: true,
        },
      },
    });

    // getting root quests (without category)
    const rootQuests = await questRepository.find({
      where: {
        campaign: { id: campaignId },
        category: IsNull(),
      },
      order: {
        order: "ASC",
      },
      select: { id: true, title: true, status: true, order: true },
    });

    return {
      categories,
      rootQuests,
    };
  },

  // CRUD

  getQuestById: async function (campaignId: string, questId: string) {
    const quest = await questRepository.findOne({
      where: {
        id: questId,
        campaign: { id: campaignId }, // safe check
      },
      // REVIEW (is it necessary?)
      relations: { category: true },
    });

    if (!quest) {
      throw new NotFoundError(
        "Квест не знайдено або він не належить цій кампанії",
      );
    }

    return quest;
  },

  createQuest: async function (campaignId: string, questData: CreateQuestDTO) {
    // safe check for category existance
    if (questData.categoryId) {
      const categoryExists = await categoryRepository.exists({
        where: {
          id: questData.categoryId,
          campaign: { id: campaignId }, // same safe check
        },
      });

      if (!categoryExists) {
        throw new BadRequestError("Вказаної категорії не існує в цій кампанії");
      }
    }

    // Finding current maximum order in category/root
    const query = questRepository
      .createQueryBuilder("quest")
      .where("quest.campaignId = :campaignId", { campaignId });

    if (questData.categoryId) {
      query.andWhere("quest.categoryId = :categoryId", {
        categoryId: questData.categoryId,
      });
    } else {
      query.andWhere("quest.categoryId IS NULL");
    }
    const { maxOrder } = await query
      .select("MAX(quest.order)", "maxOrder")
      .getRawOne();

    // can change it to 10 (and in categories too) if ever gonna implement something like lexorank
    const newOrder = maxOrder ? Number(maxOrder) + 1 : 1;

    const newQuest = questRepository.create({
      title: questData.title,
      status: questData.status || "active",
      source: questData.source || "",
      // CHANGE we have tiptap content placeholder in campaign + will have it in other places with editor, should move this to separate constant and just use it anywhere
      content: questData.content || {
        type: "doc",
        content: [{ type: "paragraph" }],
      },
      order: newOrder,
      campaign: { id: campaignId },
      category: questData.categoryId ? { id: questData.categoryId } : null,
    });

    // REVIEW return (maybe should omit some fields there)
    return await questRepository.save(newQuest);
  },

  updateQuest: async function (
    campaignId: string,
    questId: string,
    questData: UpdateQuestDTO,
  ) {
    const quest = await questRepository.findOne({
      where: { id: questId, campaign: { id: campaignId } },
    });

    if (!quest)
      throw new NotFoundError(
        "Квест не знайдено або він не належить цій кампанії",
      );

    // safe check for category existance
    if (questData.categoryId) {
      const categoryExists = await categoryRepository.exists({
        where: {
          id: questData.categoryId,
          campaign: { id: campaignId }, // same safe check
        },
      });

      if (!categoryExists) {
        throw new BadRequestError("Вказаної категорії не існує в цій кампанії");
      }
    }

    if (questData.title !== undefined) quest.title = questData.title;
    if (questData.status !== undefined) quest.status = questData.status;
    if (questData.source !== undefined) quest.source = questData.source;
    if (questData.content !== undefined) quest.content = questData.content; // TypeORM JSONB

    // REVIEW return (maybe should omit some fields there)
    return await questRepository.save(quest);
  },

  deleteQuest: async function (campaignId: string, questId: string) {
    // once again checking campaign
    const result = await questRepository.delete({
      id: questId,
      campaign: { id: campaignId },
    });

    // REVIEW maybe do silent error
    if (result.affected === 0) {
      throw new NotFoundError(
        "Квест з таким id не знайдено! (або ви намагаєтеся видалити його з помилкового кампейну)",
      );
    }

    return { success: true };
  },

  reorderItems: async function (
    campaignId: string,
    questData: ReorderItemsDTO,
  ) {
    // using transaction to update data securily and do a fallback if one quest/category can't update for some reason
    await AppDataSource.transaction(async (transactionalEntityManager) => {
      for (const item of questData.items) {
        if (item.type === "quest") {
          await transactionalEntityManager.update(
            Quest,
            { id: item.id, campaign: { id: campaignId } },
            {
              order: item.order,
              category: item.categoryId ? { id: item.categoryId } : null,
            },
          );
        } else if (item.type === "category") {
          await transactionalEntityManager.update(
            QuestCategory,
            { id: item.id, campaign: { id: campaignId } },
            { order: item.order },
          );
        }
      }
    });

    return { success: true };
  },
};

export default questService;
