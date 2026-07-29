import { In } from "typeorm";
import { AppDataSource } from "../data-source.js";
import { Widget } from "../entities/Widget.js";
import BadRequestError from "../exceptions/bad-request.js";
import NotFoundError from "../exceptions/not-found.js";
import {
  type WidgetType,
  NoteContentSchema,
  InitiativeContentSchema,
  type CreateWidgetDTO,
  type WidgetContentDTO,
  type UpdateWidgetContentDTO,
  type UpdateWidgetsLayoutDTO,
} from "../schemas/widget.schema.js";

const widgetRepository = AppDataSource.getRepository(Widget);

// REVIEW/CHANGE
// function to check exact content schema based on widget type (note, initiative etc)
// switch there is a more temporary solution and need to switch to smth idk map-like(?) when we'll have like 10 types of widgets
function validateWidgetContent(
  type: WidgetType,
  content: unknown,
): WidgetContentDTO {
  try {
    switch (type) {
      case "NOTE":
        return NoteContentSchema.parse(content || {});
      case "INITIATIVE":
        return InitiativeContentSchema.parse(content || {});
      // case "CALENDAR":
      // case "DICE_ROLLER":
      // return content || {};
      default:
        return content || {};
    }
  } catch (error) {
    throw new BadRequestError(
      "Помилковий формат контенту для цього типу віджета",
    );
  }
}

const widgetService = {
  getWidgetsByCampaign: async function (campaignId: string) {
    const widgets = widgetRepository.find({
      where: { campaign: { id: campaignId } },
      order: { zIndex: "ASC" },
    });
    return widgets;
  },

  // in this feature we're creating id on front-end, since it's anyway uuid and giving a smoother user experience (we don't have to wait until server response)
  createWidget: async function (
    campaignId: string,
    widgetData: CreateWidgetDTO,
  ): Promise<Widget> {
    // widget content there is BaseContentSchema and Record<string, any>, so we're doing shape validation
    const validatedContent = validateWidgetContent(
      widgetData.type,
      widgetData.content,
    );

    const newWidget = widgetRepository.create({
      ...widgetData,
      content: validatedContent,
      campaign: { id: campaignId },
    });

    return widgetRepository.save(newWidget);
  },

  // Видалити віджет
  deleteWidget: async function (
    campaignId: string,
    widgetId: string,
  ): Promise<{ success: boolean }> {
    const result = await widgetRepository.delete({
      id: widgetId,
      campaign: { id: campaignId },
    });

    // REVIEW still is it really needed? well at least we can show this error in toast on front-end ig
    if (result.affected === 0) {
      throw new NotFoundError("Віджет не знайдено");
    }

    return { success: true };
  },

  updateLayout: async function (
    campaignId: string,
    layoutData: UpdateWidgetsLayoutDTO,
  ): Promise<{ success: boolean }> {
    const widgetIds = layoutData.widgets.map((widget) => widget.id);

    const existingWidgets = await widgetRepository.find({
      where: { id: In(widgetIds), campaign: { id: campaignId } },
      select: { id: true },
    });

    if (existingWidgets.length !== layoutData.widgets.length) {
      throw new BadRequestError(
        "Один або кілька віджетів не знайдені у цій кампанії",
      );
    }

    await Promise.all(
      layoutData.widgets.map((widget) =>
        widgetRepository.update(widget.id, {
          x: widget.x,
          y: widget.y,
          w: widget.w,
          h: widget.h,
          zIndex: widget.zIndex,
        }),
      ),
    );

    return { success: true };
  },

  updateContent: async function (
    campaignId: string,
    widgetId: string,
    content: UpdateWidgetContentDTO,
  ): Promise<Widget> {
    const widget = await widgetRepository.findOne({
      where: { id: widgetId, campaign: { id: campaignId } },
      select: { id: true, type: true },
    });

    if (!widget) {
      throw new NotFoundError("Віджет не знайдено");
    }

    const validatedContent = validateWidgetContent(
      widget.type as WidgetType,
      content,
    );

    await widgetRepository.update(
      { id: widgetId, campaign: { id: campaignId } },
      { content: validatedContent }, // Що оновлюємо
    );

    // REVIEW maybe just return widget with changed manually content to validated content idk
    const updatedWidget = await widgetRepository.findOne({
      where: { id: widgetId },
    });

    if (!updatedWidget) {
      throw new NotFoundError("Помилка при завантаженні оновленого віджета");
    }

    return updatedWidget;
  },
};

export default widgetService;
