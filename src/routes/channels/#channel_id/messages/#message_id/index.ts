import { ChannelModel, getPermission, MessageDeleteEvent, MessageModel, MessageUpdateEvent, toObject } from "@fosscord/server-util";
import { Router, Response, Request } from "express";
import { HTTPError } from "lambert-server";
import { MessageCreateSchema } from "../../../../../schema/Message";
import { emitEvent } from "../../../../../util/Event";
import { check } from "../../../../../util/instanceOf";
import { handleMessage, postHandleMessage } from "../../../../../util/Message";

const router = Router();

router.patch("/", check(MessageCreateSchema), async (req: Request, res: Response) => {
	const { message_id, channel_id } = req.params;
	var body = req.body as MessageCreateSchema;

	var message = await MessageModel.findOne({ id: message_id, channel_id }, { author_id: true }).exec();
	if (!message) throw new HTTPError("Message not found", 404);

	const permissions = await getPermission(req.user_id, undefined, channel_id);

	if (req.user_id !== message.author_id) {
		permissions.hasThrow("MANAGE_MESSAGES");
		body = { flags: body.flags };
	}

	const opts = await handleMessage({
		...body,
		author_id: message.author_id,
		channel_id,
		id: message_id,
		edited_timestamp: new Date()
	});

	message = await MessageModel.findOneAndUpdate({ id: message_id }, opts).populate("author").exec();
	if (!message) throw new HTTPError("Message not found", 404);

	await emitEvent({
		event: "MESSAGE_UPDATE",
		channel_id,
		guild_id: message.guild_id,
		data: { ...toObject(message), nonce: undefined }
	} as MessageUpdateEvent);

	postHandleMessage(message);

	return res.json(toObject(message));
});

// TODO: delete attachments in message

router.delete("/", async (req: Request, res: Response) => {
	const { message_id, channel_id } = req.params;

	const channel = await ChannelModel.findOne({ id: channel_id }, { guild_id: true });
	if (!channel) throw new HTTPError("Channel not found", 404);
	const message = await MessageModel.findOne({ id: message_id }, { author_id: true }).exec();
	if (!message) throw new HTTPError("Message not found", 404);

	const permission = await getPermission(req.user_id, channel.guild_id, channel_id);
	if (message.author_id !== req.user_id) permission.hasThrow("MANAGE_MESSAGES");

	await MessageModel.deleteOne({ id: message_id }).exec();

	await emitEvent({
		event: "MESSAGE_DELETE",
		channel_id,
		guild_id: channel.guild_id,
		data: {
			id: message_id,
			channel_id,
			guild_id: channel.guild_id
		}
	} as MessageDeleteEvent);

	res.sendStatus(204);
});

export default router;
