import { Body, Controller, HttpStatus, Param, UseFilters, UseGuards } from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiConflictResponse,
    ApiCreatedResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiTags,
} from '@nestjs/swagger';

import { Endpoint } from '@common/decorators/base-endpoint/base-endpoint';
import { Roles } from '@common/decorators/roles/roles';
import { ApiScopeResource } from '@common/decorators/scopes';
import { HttpExceptionFilter } from '@common/exception/http-exception.filter';
import { JwtDefaultGuard } from '@common/guards/jwt-guards/def-jwt-guard';
import { RolesGuard } from '@common/guards/roles';
import { ScopesGuard } from '@common/guards/scopes';
import { errorHandler } from '@common/helpers/error-handler.helper';
import { CONTROLLERS_INFO, EXTERNAL_SQUADS_CONTROLLER } from '@libs/contracts/api';
import {
    AddUsersToExternalSquadCommand,
    CreateExternalSquadCommand,
    DeleteExternalSquadCommand,
    DeleteUsersFromExternalSquadCommand,
    GetExternalSquadByUuidCommand,
    GetExternalSquadsCommand,
    ReorderExternalSquadCommand,
    UpdateExternalSquadCommand,
} from '@libs/contracts/commands';
import { ROLE } from '@libs/contracts/constants';

import {
    AddUsersToExternalSquadParamDto,
    AddUsersToExternalSquadResponseDto,
    CreateExternalSquadBodyDto,
    CreateExternalSquadResponseDto,
    DeleteExternalSquadParamDto,
    DeleteExternalSquadResponseDto,
    GetExternalSquadByUuidParamDto,
    GetExternalSquadByUuidResponseDto,
    GetExternalSquadsResponseDto,
    RemoveUsersFromExternalSquadParamDto,
    RemoveUsersFromExternalSquadResponseDto,
    ReorderExternalSquadsBodyDto,
    ReorderExternalSquadsResponseDto,
    UpdateExternalSquadBodyDto,
    UpdateExternalSquadResponseDto,
} from './dtos';
import { ExternalSquadService } from './external-squads.service';

@ApiBearerAuth('Authorization')
@ApiScopeResource(CONTROLLERS_INFO.EXTERNAL_SQUADS.resource)
@ApiTags(CONTROLLERS_INFO.EXTERNAL_SQUADS.tag)
@Roles(ROLE.ADMIN, ROLE.API)
@UseGuards(JwtDefaultGuard, RolesGuard, ScopesGuard)
@UseFilters(HttpExceptionFilter)
@Controller(EXTERNAL_SQUADS_CONTROLLER)
export class ExternalSquadController {
    constructor(private readonly externalSquadService: ExternalSquadService) {}

    @ApiOkResponse({
        type: GetExternalSquadsResponseDto,
        description: 'External squads retrieved successfully',
    })
    @Endpoint({
        command: GetExternalSquadsCommand,
        httpCode: HttpStatus.OK,
    })
    async getExternalSquads(): Promise<GetExternalSquadsResponseDto> {
        const result = await this.externalSquadService.getExternalSquads();

        const data = errorHandler(result);
        return {
            response: data,
        };
    }

    @ApiOkResponse({
        type: GetExternalSquadByUuidResponseDto,
        description: 'External squad retrieved successfully',
    })
    @Endpoint({
        command: GetExternalSquadByUuidCommand,
        httpCode: HttpStatus.OK,
    })
    async getExternalSquadByUuid(
        @Param() param: GetExternalSquadByUuidParamDto,
    ): Promise<GetExternalSquadByUuidResponseDto> {
        const result = await this.externalSquadService.getExternalSquadByUuid(param.uuid);

        const data = errorHandler(result);
        return {
            response: data,
        };
    }

    @ApiConflictResponse({
        description: 'External squad already exists',
    })
    @ApiCreatedResponse({
        type: CreateExternalSquadResponseDto,
        description: 'External squad created successfully',
    })
    @Endpoint({
        command: CreateExternalSquadCommand,
        httpCode: HttpStatus.CREATED,
    })
    async createExternalSquad(
        @Body() body: CreateExternalSquadBodyDto,
    ): Promise<CreateExternalSquadResponseDto> {
        const result = await this.externalSquadService.createExternalSquad(body.name);

        const data = errorHandler(result);
        return {
            response: data,
        };
    }

    @ApiConflictResponse({
        description: 'External squad already exists',
    })
    @ApiNotFoundResponse({
        description: 'External squad not found',
    })
    @ApiOkResponse({
        type: UpdateExternalSquadResponseDto,
        description: 'External squad updated successfully',
    })
    @Endpoint({
        command: UpdateExternalSquadCommand,
        httpCode: HttpStatus.OK,
    })
    async updateExternalSquad(
        @Body() body: UpdateExternalSquadBodyDto,
    ): Promise<UpdateExternalSquadResponseDto> {
        const result = await this.externalSquadService.updateExternalSquad(body);

        const data = errorHandler(result);
        return {
            response: data,
        };
    }

    @ApiNotFoundResponse({
        description: 'External squad not found',
    })
    @ApiOkResponse({
        type: DeleteExternalSquadResponseDto,
        description: 'External squad deleted successfully',
    })
    @Endpoint({
        command: DeleteExternalSquadCommand,
        httpCode: HttpStatus.OK,
    })
    async deleteExternalSquad(
        @Param() param: DeleteExternalSquadParamDto,
    ): Promise<DeleteExternalSquadResponseDto> {
        const result = await this.externalSquadService.deleteExternalSquad(param.uuid);

        const data = errorHandler(result);
        return {
            response: data,
        };
    }

    @ApiNotFoundResponse({
        description: 'External squad not found',
    })
    @ApiOkResponse({
        type: AddUsersToExternalSquadResponseDto,
        description: 'Task added to external job queue',
    })
    @Endpoint({
        command: AddUsersToExternalSquadCommand,
        httpCode: HttpStatus.OK,
    })
    async addUsersToExternalSquad(
        @Param() param: AddUsersToExternalSquadParamDto,
    ): Promise<AddUsersToExternalSquadResponseDto> {
        const result = await this.externalSquadService.addUsersToExternalSquad(param.uuid);

        const data = errorHandler(result);
        return {
            response: data,
        };
    }

    @ApiNotFoundResponse({
        description: 'External squad not found',
    })
    @ApiOkResponse({
        type: RemoveUsersFromExternalSquadResponseDto,
        description: 'Task added to external job queue',
    })
    @Endpoint({
        command: DeleteUsersFromExternalSquadCommand,
        httpCode: HttpStatus.OK,
    })
    async removeUsersFromExternalSquad(
        @Param() param: RemoveUsersFromExternalSquadParamDto,
    ): Promise<RemoveUsersFromExternalSquadResponseDto> {
        const result = await this.externalSquadService.removeUsersFromExternalSquad(param.uuid);

        const data = errorHandler(result);
        return {
            response: data,
        };
    }

    @ApiOkResponse({
        type: ReorderExternalSquadsResponseDto,
        description: 'External squads reordered successfully',
    })
    @Endpoint({
        command: ReorderExternalSquadCommand,
        httpCode: HttpStatus.OK,
    })
    async reorderExternalSquads(
        @Body() body: ReorderExternalSquadsBodyDto,
    ): Promise<ReorderExternalSquadsResponseDto> {
        const result = await this.externalSquadService.reorderExternalSquads(body);

        const data = errorHandler(result);
        return {
            response: data,
        };
    }
}
