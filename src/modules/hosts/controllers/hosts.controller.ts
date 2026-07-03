import { Body, Controller, HttpStatus, Param, UseFilters, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

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

    @Endpoint({
        command: GetHostsTagsCommand,
        httpCode: HttpStatus.OK,
        type: GetHostsTagsResponseDto,
    })
    async getHostsTags(): Promise<GetHostsTagsResponseDto> {
        const result = await this.hostsService.getHostsTags();

        const data = errorHandler(result);
        return {
            response: new GetAllHostTagsResponseModel(data),
        };
    }

    @Endpoint({
        command: CreateHostCommand,
        httpCode: HttpStatus.CREATED,
        type: CreateHostResponseDto,
    })
    async createHost(@Body() body: CreateHostBodyDto): Promise<CreateHostResponseDto> {
        const result = await this.hostsService.createHost(body);

        const data = errorHandler(result);
        return {
            response: new HostResponseModel(data),
        };
    }

    @Endpoint({
        command: UpdateHostCommand,
        httpCode: HttpStatus.OK,
        type: UpdateHostResponseDto,
    })
    async updateHost(@Body() body: UpdateHostBodyDto): Promise<UpdateHostResponseDto> {
        const result = await this.hostsService.updateHost(body);

        const data = errorHandler(result);
        return {
            response: new HostResponseModel(data),
        };
    }

    @Endpoint({
        command: GetHostsCommand,
        httpCode: HttpStatus.OK,
        type: GetHostsResponseDto,
    })
    async getHosts(): Promise<GetHostsResponseDto> {
        const result = await this.hostsService.getHosts();

        const data = errorHandler(result);
        return {
            response: data.map((host) => new HostResponseModel(host)),
        };
    }

    @Endpoint({
        command: GetHostCommand,
        httpCode: HttpStatus.OK,
        type: GetHostResponseDto,
    })
    async getOneHost(@Param() params: GetHostParamDto): Promise<GetHostResponseDto> {
        const result = await this.hostsService.getHost(params.uuid);

        const data = errorHandler(result);
        return {
            response: new HostResponseModel(data),
        };
    }

    @Endpoint({
        command: ReorderHostsCommand,
        httpCode: HttpStatus.OK,
        type: ReorderHostsResponseDto,
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

    @Endpoint({
        command: DeleteHostCommand,
        httpCode: HttpStatus.NO_CONTENT,
    })
    async deleteHost(@Param() params: DeleteHostParamDto) {
        const result = await this.hostsService.deleteHost(params.uuid);

        errorHandler(result);
        return;
    }
}
