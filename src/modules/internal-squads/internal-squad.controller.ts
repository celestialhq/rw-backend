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
import { CONTROLLERS_INFO, INTERNAL_SQUADS_CONTROLLER } from '@libs/contracts/api';
import {
    AddUsersToInternalSquadCommand,
    CreateInternalSquadCommand,
    DeleteInternalSquadCommand,
    DeleteUsersFromInternalSquadCommand,
    GetInternalSquadAccessibleNodesCommand,
    GetInternalSquadCommand,
    GetInternalSquadsCommand,
    ReorderInternalSquadCommand,
    UpdateInternalSquadCommand,
} from '@libs/contracts/commands';
import { ROLE } from '@libs/contracts/constants';

import {
    AddUsersToInternalSquadParamDto,
    AddUsersToInternalSquadResponseDto,
    CreateInternalSquadBodyDto,
    CreateInternalSquadResponseDto,
    DeleteInternalSquadParamDto,
    DeleteInternalSquadResponseDto,
    GetInternalSquadAccessibleNodesParamDto,
    GetInternalSquadAccessibleNodesResponseDto,
    GetInternalSquadParamDto,
    GetInternalSquadResponseDto,
    GetInternalSquadsResponseDto,
    RemoveUsersFromInternalSquadParamDto,
    RemoveUsersFromInternalSquadResponseDto,
    ReorderInternalSquadsBodyDto,
    ReorderInternalSquadsResponseDto,
    UpdateInternalSquadBodyDto,
    UpdateInternalSquadResponseDto,
} from './dtos';
import { InternalSquadService } from './internal-squad.service';

@ApiBearerAuth('Authorization')
@ApiScopeResource(CONTROLLERS_INFO.INTERNAL_SQUADS.resource)
@ApiTags(CONTROLLERS_INFO.INTERNAL_SQUADS.tag)
@Roles(ROLE.ADMIN, ROLE.API)
@UseGuards(JwtDefaultGuard, RolesGuard, ScopesGuard)
@UseFilters(HttpExceptionFilter)
@Controller(INTERNAL_SQUADS_CONTROLLER)
export class InternalSquadController {
    constructor(private readonly internalSquadService: InternalSquadService) {}

    @ApiOkResponse({
        type: GetInternalSquadsResponseDto,
        description: 'Internal squads retrieved successfully',
    })
    @Endpoint({
        command: GetInternalSquadsCommand,
        httpCode: HttpStatus.OK,
    })
    async getInternalSquads(): Promise<GetInternalSquadsResponseDto> {
        const result = await this.internalSquadService.getInternalSquads();

        const data = errorHandler(result);
        return {
            response: data,
        };
    }

    @ApiOkResponse({
        type: GetInternalSquadResponseDto,
        description: 'Internal squad retrieved successfully',
    })
    @Endpoint({
        command: GetInternalSquadCommand,
        httpCode: HttpStatus.OK,
    })
    async getInternalSquadByUuid(
        @Param() param: GetInternalSquadParamDto,
    ): Promise<GetInternalSquadResponseDto> {
        const result = await this.internalSquadService.getInternalSquadByUuid(param.uuid);

        const data = errorHandler(result);
        return {
            response: data,
        };
    }

    @ApiConflictResponse({
        description: 'Internal squad already exists',
    })
    @ApiCreatedResponse({
        type: CreateInternalSquadResponseDto,
        description: 'Internal squad created successfully',
    })
    @Endpoint({
        command: CreateInternalSquadCommand,
        httpCode: HttpStatus.CREATED,
    })
    async createInternalSquad(
        @Body() createInternalSquadDto: CreateInternalSquadBodyDto,
    ): Promise<CreateInternalSquadResponseDto> {
        const result = await this.internalSquadService.createInternalSquad(
            createInternalSquadDto.name,
            createInternalSquadDto.inbounds,
        );

        const data = errorHandler(result);
        return {
            response: data,
        };
    }

    @ApiNotFoundResponse({
        description: 'Internal squad not found',
    })
    @ApiOkResponse({
        type: GetInternalSquadAccessibleNodesResponseDto,
        description: 'Internal squad accessible nodes fetched successfully',
    })
    @Endpoint({
        command: GetInternalSquadAccessibleNodesCommand,
        httpCode: HttpStatus.OK,
    })
    async getInternalSquadAccessibleNodes(
        @Param() param: GetInternalSquadAccessibleNodesParamDto,
    ): Promise<GetInternalSquadAccessibleNodesResponseDto> {
        const result = await this.internalSquadService.getInternalSquadAccessibleNodes(param.uuid);

        const data = errorHandler(result);
        return {
            response: data,
        };
    }

    @ApiConflictResponse({
        description: 'Internal squad already exists',
    })
    @ApiNotFoundResponse({
        description: 'Internal squad not found',
    })
    @ApiOkResponse({
        type: UpdateInternalSquadResponseDto,
        description: 'Internal squad updated successfully',
    })
    @Endpoint({
        command: UpdateInternalSquadCommand,
        httpCode: HttpStatus.OK,
    })
    async updateInternalSquad(
        @Body() body: UpdateInternalSquadBodyDto,
    ): Promise<UpdateInternalSquadResponseDto> {
        const result = await this.internalSquadService.updateInternalSquad(
            body.uuid,
            body.name,
            body.inbounds,
        );

        const data = errorHandler(result);
        return {
            response: data,
        };
    }

    @ApiNotFoundResponse({
        description: 'Internal squad not found',
    })
    @ApiOkResponse({
        type: DeleteInternalSquadResponseDto,
        description: 'Internal squad deleted successfully',
    })
    @Endpoint({
        command: DeleteInternalSquadCommand,
        httpCode: HttpStatus.OK,
    })
    async deleteInternalSquad(
        @Param() param: DeleteInternalSquadParamDto,
    ): Promise<DeleteInternalSquadResponseDto> {
        const result = await this.internalSquadService.deleteInternalSquad(param.uuid);

        const data = errorHandler(result);
        return {
            response: data,
        };
    }

    @ApiNotFoundResponse({
        description: 'Internal squad not found',
    })
    @ApiOkResponse({
        type: AddUsersToInternalSquadResponseDto,
        description: 'Task added to internal job queue',
    })
    @Endpoint({
        command: AddUsersToInternalSquadCommand,
        httpCode: HttpStatus.OK,
    })
    async addUsersToInternalSquad(
        @Param() param: AddUsersToInternalSquadParamDto,
    ): Promise<AddUsersToInternalSquadResponseDto> {
        const result = await this.internalSquadService.addUsersToInternalSquad(param.uuid);

        const data = errorHandler(result);
        return {
            response: data,
        };
    }

    @ApiNotFoundResponse({
        description: 'Internal squad not found',
    })
    @ApiOkResponse({
        type: RemoveUsersFromInternalSquadResponseDto,
        description: 'Task added to internal job queue',
    })
    @Endpoint({
        command: DeleteUsersFromInternalSquadCommand,
        httpCode: HttpStatus.OK,
    })
    async removeUsersFromInternalSquad(
        @Param() param: RemoveUsersFromInternalSquadParamDto,
    ): Promise<RemoveUsersFromInternalSquadResponseDto> {
        const result = await this.internalSquadService.removeUsersFromInternalSquad(param.uuid);

        const data = errorHandler(result);
        return {
            response: data,
        };
    }

    @ApiOkResponse({
        type: ReorderInternalSquadsResponseDto,
        description: 'Internal squads reordered successfully',
    })
    @Endpoint({
        command: ReorderInternalSquadCommand,
        httpCode: HttpStatus.OK,
    })
    async reorderInternalSquads(
        @Body() body: ReorderInternalSquadsBodyDto,
    ): Promise<ReorderInternalSquadsResponseDto> {
        const result = await this.internalSquadService.reorderInternalSquads(body);

        const data = errorHandler(result);
        return {
            response: data,
        };
    }
}
