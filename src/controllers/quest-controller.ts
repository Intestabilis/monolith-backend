import type { Request, Response, NextFunction } from "express";
import questCategoryService from "../services/quest-category-service.js";
import questService from "../services/quest-service.js";
import type { ParamsDictionary } from "express-serve-static-core";

interface QuestParams {
  campaignId: string;
  questId?: string;
  categoryId?: string;
}

const questController = {
  // get methods

  getQuestTree: async function (
    req: Request<ParamsDictionary & QuestParams>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { campaignId } = req.params;
      const treeData = await questService.getQuestTree(campaignId);

      res.status(200).json(treeData);
    } catch (error) {
      next(error);
    }
  },

  getQuestById: async function (
    req: Request<ParamsDictionary & QuestParams>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { campaignId, questId } = req.params;
      const quest = await questService.getQuestById(campaignId, questId!);

      res.status(200).json(quest);
    } catch (error) {
      next(error);
    }
  },

  // quests

  createQuest: async function (
    req: Request<ParamsDictionary & QuestParams>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { campaignId } = req.params;
      const questData = req.body;

      const newQuest = await questService.createQuest(campaignId, questData);
      res.status(201).json(newQuest);
    } catch (error) {
      next(error);
    }
  },

  updateQuest: async function (
    req: Request<ParamsDictionary & QuestParams>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { campaignId, questId } = req.params;
      const questData = req.body;

      const updatedQuest = await questService.updateQuest(
        campaignId,
        questId!,
        questData,
      );
      res.status(200).json(updatedQuest);
    } catch (error) {
      next(error);
    }
  },

  deleteQuest: async function (
    req: Request<ParamsDictionary & QuestParams>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { campaignId, questId } = req.params;

      await questService.deleteQuest(campaignId, questId!);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },

  // categories
  createCategory: async function (
    req: Request<ParamsDictionary & QuestParams>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { campaignId } = req.params;
      const categoryData = req.body;

      const newCategory = await questCategoryService.createCategory(
        campaignId,
        categoryData,
      );
      res.status(201).json(newCategory);
    } catch (error) {
      next(error);
    }
  },

  updateCategory: async function (
    req: Request<ParamsDictionary & QuestParams>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { campaignId, categoryId } = req.params;
      const categoryData = req.body;

      const updatedCategory = await questCategoryService.updateCategory(
        campaignId,
        categoryId!,
        categoryData,
      );
      res.status(200).json(updatedCategory);
    } catch (error) {
      next(error);
    }
  },

  deleteCategory: async function (
    req: Request<ParamsDictionary & QuestParams>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { campaignId, categoryId } = req.params;

      await questCategoryService.deleteCategory(campaignId, categoryId!);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },

  //  reorder for drag-on-drop

  reorderItems: async function (
    req: Request<ParamsDictionary & QuestParams>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { campaignId } = req.params;
      const treeData = req.body;

      await questService.reorderItems(campaignId, treeData);
      res
        .status(200)
        .json({ success: true, message: "Порядок квестів успішно оновлено" });
    } catch (error) {
      next(error);
    }
  },
};

export default questController;
