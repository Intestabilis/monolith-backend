import type { Request, Response, NextFunction } from "express";
import widgetService from "../services/widget-service.js";
import type { ParamsDictionary } from "express-serve-static-core";

interface WidgetParams {
  campaignId: string;
  widgetId?: string;
}

const widgetController = {
  // CRUD

  getWidgets: async function (
    req: Request<ParamsDictionary & WidgetParams>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { campaignId } = req.params;
      const widgets = await widgetService.getWidgetsByCampaign(campaignId);

      res.status(200).json(widgets);
    } catch (error) {
      next(error);
    }
  },

  createWidget: async function (
    req: Request<ParamsDictionary & WidgetParams>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { campaignId } = req.params;
      const widgetData = req.body;

      const newWidget = await widgetService.createWidget(
        campaignId,
        widgetData,
      );

      res.status(201).json(newWidget);
    } catch (error) {
      next(error);
    }
  },

  updateContent: async function (
    req: Request<ParamsDictionary & WidgetParams>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { campaignId, widgetId } = req.params;
      const { content } = req.body;

      const updatedWidget = await widgetService.updateContent(
        campaignId,
        widgetId!,
        content,
      );

      res.status(200).json(updatedWidget);
    } catch (error) {
      next(error);
    }
  },

  deleteWidget: async function (
    req: Request<ParamsDictionary & WidgetParams>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { campaignId, widgetId } = req.params;

      await widgetService.deleteWidget(campaignId, widgetId!);

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },

  // Layout update

  updateLayout: async function (
    req: Request<ParamsDictionary & WidgetParams>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { campaignId } = req.params;
      const layoutData = req.body;
      await widgetService.updateLayout(campaignId, layoutData);

      res.status(200).json({ message: "Layout successfully updated" });
    } catch (error) {
      next(error);
    }
  },
};

export default widgetController;
