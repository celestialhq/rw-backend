import { z } from 'zod';

import { NODES_ROUTES, REST_API } from '../../../api';
import { getEndpointDetails } from '../../../constants';

export namespace RestartNodeCommand {
    export const url = REST_API.NODES.ACTIONS.RESTART;
    export const TSQ_url = url(':uuid');

    export const endpointDetails = getEndpointDetails(
        NODES_ROUTES.ACTIONS.RESTART(':uuid'),
        'post',
        'Restart node',
        { scope: 'restart', kind: 'write' },
    );

    export const RequestParamSchema = z.object({
        uuid: z.string().uuid(),
    });

    export const RequestBodySchema = z.object({
        forceRestart: z.boolean(),
    });

    export const ResponseSchema = z.object({
        response: z.object({
            eventSent: z.boolean(),
        }),
    });

    export type RequestParam = z.infer<typeof RequestParamSchema>;
    export type RequestBody = z.infer<typeof RequestBodySchema>;
    export type Response = z.infer<typeof ResponseSchema>;
}
