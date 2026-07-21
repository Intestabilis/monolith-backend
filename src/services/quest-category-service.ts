import { AppDataSource } from "../data-source.js";
import { QuestCategory } from "../entities/QuestCategory.js";
import NotFoundError from "../exceptions/not-found.js";
import type {
  CreateCategoryDTO,
  UpdateCategoryDTO,
} from "../schemas/quest.schema.js";

const categoryRepository = AppDataSource.getRepository(QuestCategory);

const questCategoryService = {
  createCategory: async function (
    campaignId: string,
    categoryData: CreateCategoryDTO,
  ) {
    // finding max order in categories
    const { maxOrder } = await categoryRepository
      .createQueryBuilder("category")
      .where("category.campaignId = :campaignId", { campaignId })
      .select("MAX(category.order)", "maxOrder")
      .getRawOne();

    const newOrder = maxOrder ? Number(maxOrder) + 1 : 1;

    const newCategory = categoryRepository.create({
      title: categoryData.title,
      order: newOrder,
      campaign: { id: campaignId },
    });

    return await categoryRepository.save(newCategory);
  },

  updateCategory: async function (
    campaignId: string,
    categoryId: string,
    categoryData: UpdateCategoryDTO,
  ) {
    const category = await categoryRepository.findOne({
      where: { id: categoryId, campaign: { id: campaignId } },
    });

    if (!category) {
      throw new NotFoundError(
        "Категорії з таким id не існує! (або ви намагаєтеся оновити її для помилкової кампанії)",
      );
    }

    if (categoryData.title !== undefined) category.title = categoryData.title;

    return await categoryRepository.save(category);
  },

  deleteCategory: async function (campaignId: string, categoryId: string) {
    const result = await categoryRepository.delete({
      id: categoryId,
      campaign: { id: campaignId },
    });

    // REVIEW error handling
    if (result.affected === 0) {
      throw new NotFoundError(
        "Категорії з таким id не існує! (або ви намагаєтеся видалити її у помилковій кампанії)",
      );
    }

    return { success: true };
  },
};

export default questCategoryService;
