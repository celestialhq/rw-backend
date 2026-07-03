import { applyDecorators, Patch, Delete, Put, All, Post, Get, HttpCode } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

import { ApiScopeEndpoint } from '@common/decorators/scopes';
import { EndpointDetails } from '@libs/contracts/constants';

interface ApiEndpointOptions {
    command: { endpointDetails: EndpointDetails };
    httpCode: number;
}

export function Endpoint(options: ApiEndpointOptions) {
    const method = options.command.endpointDetails.REQUEST_METHOD.toLowerCase();

    return applyDecorators(
        resolveRequestMethod(method)(options.command.endpointDetails.CONTROLLER_URL),
        ApiScopeEndpoint(options.command.endpointDetails),
        HttpCode(options.httpCode),
        ApiOperation({
            summary: options.command.endpointDetails.METHOD_DESCRIPTION,
            description: options.command.endpointDetails.METHOD_LONG_DESCRIPTION,
        }),
    );
}

function resolveRequestMethod(method: string) {
    switch (method) {
        case 'get':
            return Get;
        case 'post':
            return Post;
        case 'put':
            return Put;
        case 'delete':
            return Delete;
        case 'patch':
            return Patch;
        default:
            return All;
    }
}
