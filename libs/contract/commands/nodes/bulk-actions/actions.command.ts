import { z } from 'zod';

import { NODES_ROUTES, REST_API } from '../../../api';
import { getEndpointDetails, NODES_BULK_ACTIONS } from '../../../constants';

export namespace BulkNodesActionsCommand {
    export const url = REST_API.NODES.BULK_ACTIONS.ACTIONS;
    export const TSQ_url = url;

    export const endpointDetails = getEndpointDetails(
        NODES_ROUTES.BULK_ACTIONS.ACTIONS,
        'post',
        'Perform actions for many nodes',
        { scope: 'bulk-actions', kind: 'write' },
    );

    export const RequestBodySchema = z.object({
        uuids: z.array(z.string().uuid()).min(1, 'Must be at least 1 Node UUID'),
        action: z.nativeEnum(NODES_BULK_ACTIONS),
    });

    export const ResponseSchema = z.object({
        response: z.object({
            eventSent: z.boolean(),
        }),
    });

    export type RequestBody = z.infer<typeof RequestBodySchema>;
    export type Response = z.infer<typeof ResponseSchema>;
}
