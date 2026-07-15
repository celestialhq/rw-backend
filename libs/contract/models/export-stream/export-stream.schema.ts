import z from 'zod';

const USER_USAGE_STREAM_KEY = 'ioraw:export:user_usage';
const SUBSCRIPTION_REQUESTS_STREAM_KEY = 'ioraw:export:subscription_requests';

export const USER_USAGE_STREAM_MESSAGE_VERSION = '1';

export const UserUsageStreamRecordSchema = z.object({
    userId: z.string().regex(/^\d+$/).describe('User ID (bigint as string).'),
    totalBytes: z
        .string()
        .regex(/^\d+$/)
        .describe('Traffic consumed by the user in this batch, bytes (bigint as string).'),
});

export const RemnawaveUserUsageStreamMessageSchema = z
    .object({
        v: z.literal(USER_USAGE_STREAM_MESSAGE_VERSION).describe('Message schema version.'),
        nodeId: z
            .string()
            .regex(/^\d+$/)
            .describe('Node ID the batch belongs to (bigint as string).'),
        ts: z.iso
            .datetime()
            .transform((str) => new Date(str))
            .describe('Time the batch was exported (ISO 8601, UTC).'),
        records: z
            .string()
            .regex(/^\d+:\d+(;\d+:\d+)*$/)
            .transform((raw) =>
                raw.split(';').map((pair) => {
                    const [userId, totalBytes] = pair.split(':');
                    return { userId, totalBytes };
                }),
            )
            .pipe(z.array(UserUsageStreamRecordSchema))
            .describe('User traffic deltas: "userId:totalBytes" pairs separated by ";".'),
    })
    .meta({
        description: `A single message of the "${USER_USAGE_STREAM_KEY}" Redis Stream (EXPORT_TO_STREAM_ENABLED).`,
    });

export type TUserUsageStreamRecord = z.infer<typeof UserUsageStreamRecordSchema>;
export type TRemnawaveUserUsageStreamMessage = z.infer<
    typeof RemnawaveUserUsageStreamMessageSchema
>;

export const SUBSCRIPTION_REQUEST_STREAM_MESSAGE_VERSION = '1';

export const RemnawaveSubscriptionRequestStreamMessageSchema = z
    .object({
        v: z
            .literal(SUBSCRIPTION_REQUEST_STREAM_MESSAGE_VERSION)
            .describe('Message schema version.'),
        userId: z
            .string()
            .regex(/^\d+$/)
            .describe('ID of the user who requested the subscription (bigint as string).'),
        requestAt: z.iso
            .datetime()
            .transform((str) => new Date(str))
            .describe('Time of the subscription request (ISO 8601, UTC).'),
        requestIp: z.string().optional().describe('Client IP address, omitted if unknown.'),
        userAgent: z.string().optional().describe('Client User-Agent, omitted if unknown.'),
    })
    .meta({
        description: `A single message of the "${SUBSCRIPTION_REQUESTS_STREAM_KEY}" Redis Stream (EXPORT_TO_STREAM_ENABLED).`,
    });

export type TRemnawaveSubscriptionRequestStreamMessage = z.infer<
    typeof RemnawaveSubscriptionRequestStreamMessageSchema
>;
