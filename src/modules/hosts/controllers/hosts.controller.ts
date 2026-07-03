import { Body, Controller, HttpStatus, Param, UseFilters, UseGuards } from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiCreatedResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiTags,
} from '@nestjs/swagger';

import { Endpoint } from '@common/decorators/base-endpoint';
import { Roles } from '@common/decorators/roles/roles';
import { ApiScopeResource } from '@common/decorators/scopes';
import { HttpExceptionFilter } from '@common/exception/http-exception.filter';
import { JwtDefaultGuard } from '@common/guards/jwt-guards/def-jwt-guard';
import { RolesGuard } from '@common/guards/roles/roles.guard';
import { ScopesGuard } from '@common/guards/scopes';
import { errorHandler } from '@common/helpers/error-handler.helper';
import { CONTROLLERS_INFO, HOSTS_CONTROLLER } from '@libs/contracts/api';
import {
    CreateHostCommand,
    DeleteHostCommand,
    GetHostsCommand,
    GetHostsTagsCommand,
    GetHostCommand,
    ReorderHostsCommand,
    UpdateHostCommand,
} from '@libs/contracts/commands';
import { ROLE } from '@libs/contracts/constants';

import {
    ReorderHostsBodyDto,
    ReorderHostsResponseDto,
    GetHostsTagsResponseDto,
    CreateHostResponseDto,
    CreateHostBodyDto,
    DeleteHostParamDto,
    DeleteHostResponseDto,
    GetHostsResponseDto,
    UpdateHostResponseDto,
    UpdateHostBodyDto,
    GetHostResponseDto,
    GetHostParamDto,
} from '../dtos';
import { HostsService } from '../hosts.service';
import { GetAllHostTagsResponseModel, HostResponseModel } from '../models';

@ApiBearerAuth('Authorization')
@ApiScopeResource(CONTROLLERS_INFO.HOSTS.resource)
@ApiTags(CONTROLLERS_INFO.HOSTS.tag)
@Roles(ROLE.ADMIN, ROLE.API)
@UseGuards(JwtDefaultGuard, RolesGuard, ScopesGuard)
@UseFilters(HttpExceptionFilter)
@Controller(HOSTS_CONTROLLER)
export class HostsController {
    constructor(private readonly hostsService: HostsService) {}

    @ApiOkResponse({
        type: GetHostsTagsResponseDto,
        description: 'Host tags fetched successfully',
    })
    @Endpoint({
        command: GetHostsTagsCommand,
        httpCode: HttpStatus.OK,
    })
    async getHostsTags(): Promise<GetHostsTagsResponseDto> {
        const result = await this.hostsService.getHostsTags();

        const data = errorHandler(result);
        return {
            response: new GetAllHostTagsResponseModel(data),
        };
    }

    @ApiCreatedResponse({
        type: CreateHostResponseDto,
        description: 'Host created successfully',
    })
    @Endpoint({
        command: CreateHostCommand,
        httpCode: HttpStatus.CREATED,
    })
    async createHost(@Body() body: CreateHostBodyDto): Promise<CreateHostResponseDto> {
        const result = await this.hostsService.createHost(body);

        const data = errorHandler(result);
        return {
            response: new HostResponseModel(data),
        };
    }

    @ApiOkResponse({
        type: UpdateHostResponseDto,
        description: 'Host updated successfully',
    })
    @Endpoint({
        command: UpdateHostCommand,
        httpCode: HttpStatus.OK,
    })
    async updateHost(@Body() body: UpdateHostBodyDto): Promise<UpdateHostResponseDto> {
        const result = await this.hostsService.updateHost(body);

        const data = errorHandler(result);
        return {
            response: new HostResponseModel(data),
        };
    }

    @ApiOkResponse({
        type: GetHostsResponseDto,
        description: 'Hosts fetched successfully',
    })
    @Endpoint({
        command: GetHostsCommand,
        httpCode: HttpStatus.OK,
    })
    async getHosts(): Promise<GetHostsResponseDto> {
        const result = await this.hostsService.getHosts();

        const data = errorHandler(result);
        return {
            response: data.map((host) => new HostResponseModel(host)),
        };
    }

    @ApiOkResponse({
        type: GetHostResponseDto,
        description: 'Host fetched successfully',
    })
    @Endpoint({
        command: GetHostCommand,
        httpCode: HttpStatus.OK,
    })
    async getOneHost(@Param() params: GetHostParamDto): Promise<GetHostResponseDto> {
        const result = await this.hostsService.getHost(params.uuid);

        const data = errorHandler(result);
        return {
            response: new HostResponseModel(data),
        };
    }

    @ApiOkResponse({
        type: ReorderHostsResponseDto,
        description: 'Hosts reordered successfully',
    })
    @Endpoint({
        command: ReorderHostsCommand,
        httpCode: HttpStatus.OK,
    })
    async reorderHosts(@Body() body: ReorderHostsBodyDto): Promise<ReorderHostsResponseDto> {
        const result = await this.hostsService.reorderHosts(body);

        const data = errorHandler(result);
        return {
            response: {
                isUpdated: data.isUpdated,
            },
        };
    }

    @ApiNotFoundResponse({
        description: 'Host not found',
    })
    @ApiOkResponse({
        type: DeleteHostResponseDto,
        description: 'Host deleted successfully',
    })
    @Endpoint({
        command: DeleteHostCommand,
        httpCode: HttpStatus.OK,
    })
    async deleteHost(@Param() params: DeleteHostParamDto): Promise<DeleteHostResponseDto> {
        const result = await this.hostsService.deleteHost(params.uuid);

        const data = errorHandler(result);
        return {
            response: data,
        };
    }
}
