import { z } from 'zod';

import { REST_API } from '../../api';
import { REQUEST_TEMPLATE_TYPE } from '../../constants';

export namespace GetSubscriptionByShortUuidByClientTypeCommand {
    export const url = REST_API.SUBSCRIPTION.GET;
    export const TSQ_url = url(':shortUuid');

    export const RequestParamSchema = z.object({
        shortUuid: z.string(),
        clientType: z.nativeEnum(REQUEST_TEMPLATE_TYPE, {
            message: 'Invalid client type.',
        }),
    });

    export type RequestParam = z.infer<typeof RequestParamSchema>;
}
