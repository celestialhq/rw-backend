import { CONTROLLERS_INFO, NODES_CONTROLLER } from '@contract/api';
import { ROLE } from '@contract/constants';

import { Body, Controller, HttpStatus, Param, UseFilters, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { Endpoint } from '@common/decorators/base-endpoint';
import { Roles } from '@common/decorators/roles/roles';
import { ApiScopeResource } from '@common/decorators/scopes';
import { HttpExceptionFilter } from '@common/exception/http-exception.filter';
import { JwtDefaultGuard } from '@common/guards/jwt-guards/def-jwt-guard';
import { RolesGuard } from '@common/guards/roles/roles.guard';
import { ScopesGuard } from '@common/guards/scopes';
import { errorHandler } from '@common/helpers/error-handler.helper';
import {
    CreateNodeCommand,
    DeleteNodeCommand,
    DisableNodeCommand,
    EnableNodeCommand,
    GetNodesCommand,
    GetNodesTagsCommand,
    GetNodeCommand,
    BulkNodesProfileModificationCommand,
    ReorderNodesCommand,
    ResetNodeTrafficCommand,
    RestartAllNodesCommand,
    RestartNodeCommand,
    UpdateNodeCommand,
    BulkNodesActionsCommand,
    BulkNodesUpdateCommand,
} from '@libs/contracts/commands';

import {
    BulkNodesActionsBodyDto,
    BulkNodesActionsResponseDto,
    BulkNodesUpdateBodyDto,
    BulkNodesUpdateResponseDto,
    CreateNodeBodyDto,
    CreateNodeResponseDto,
    DeleteNodeParamDto,
    DeleteNodeResponseDto,
    DisableNodeParamDto,
    DisableNodeResponseDto,
    EnableNodeResponseDto,
    GetNodesResponseDto,
    GetNodesTagsResponseDto,
    GetNodeParamDto,
    GetNodeResponseDto,
    ProfileModificationBodyDto,
    ProfileModificationResponseDto,
    ReorderNodesBodyDto,
    ResetNodeTrafficParamDto,
    ResetNodeTrafficResponseDto,
    RestartAllNodesResponseDto,
    RestartNodeParamDto,
    RestartNodeBodyDto,
    RestartNodeResponseDto,
    UpdateNodeResponseDto,
    EnableNodeParamDto,
    UpdateNodeBodyDto,
    RestartAllNodesBodyDto,
    ReorderNodesResponseDto,
} from './dtos';
import { GetAllNodesTagsResponseModel } from './models';
import { NodesService } from './nodes.service';

@ApiBearerAuth('Authorization')
@ApiScopeResource(CONTROLLERS_INFO.NODES.resource)
@ApiTags(CONTROLLERS_INFO.NODES.tag)
@Roles(ROLE.ADMIN, ROLE.API)
@UseGuards(JwtDefaultGuard, RolesGuard, ScopesGuard)
@UseFilters(HttpExceptionFilter)
@Controller(NODES_CONTROLLER)
export class NodesController {
    constructor(private readonly nodesService: NodesService) {}

    @ApiOkResponse({
        type: GetNodesTagsResponseDto,
        description: 'Nodes tags fetched',
    })
    @Endpoint({
        command: GetNodesTagsCommand,
        httpCode: HttpStatus.OK,
    })
    async getNodesTags(): Promise<GetNodesTagsResponseDto> {
        const res = await this.nodesService.getAllNodesTags();
        const data = errorHandler(res);
        return {
            response: new GetAllNodesTagsResponseModel(data),
        };
    }

    @ApiCreatedResponse({
        type: CreateNodeResponseDto,
        description: 'Node created successfully',
    })
    @Endpoint({
        command: CreateNodeCommand,
        httpCode: HttpStatus.CREATED,
    })
    async createNode(@Body() body: CreateNodeBodyDto): Promise<CreateNodeResponseDto> {
        const result = await this.nodesService.createNode(body);

        const data = errorHandler(result);
        return {
            response: data,
        };
    }

    @ApiOkResponse({
        type: GetNodesResponseDto,
        description: 'Nodes fetched',
    })
    @Endpoint({
        command: GetNodesCommand,
        httpCode: HttpStatus.OK,
    })
    async getNodes(): Promise<GetNodesResponseDto> {
        const res = await this.nodesService.getAllNodes();
        const data = errorHandler(res);
        return {
            response: data,
        };
    }

    @ApiOkResponse({
        type: GetNodeResponseDto,
        description: 'Node fetched',
    })
    @Endpoint({
        command: GetNodeCommand,
        httpCode: HttpStatus.OK,
    })
    async getNode(@Param() uuid: GetNodeParamDto): Promise<GetNodeResponseDto> {
        const res = await this.nodesService.getOneNode(uuid.uuid);
        const data = errorHandler(res);
        return {
            response: data,
        };
    }

    @ApiOkResponse({
        type: EnableNodeResponseDto,
        description: 'Node enabled',
    })
    @Endpoint({
        command: EnableNodeCommand,
        httpCode: HttpStatus.OK,
    })
    async enableNode(@Param() param: EnableNodeParamDto): Promise<EnableNodeResponseDto> {
        const res = await this.nodesService.enableNode(param.uuid);
        const data = errorHandler(res);
        return {
            response: data,
        };
    }

    @ApiOkResponse({
        type: DisableNodeResponseDto,
        description: 'Node disabled',
    })
    @Endpoint({
        command: DisableNodeCommand,
        httpCode: HttpStatus.OK,
    })
    async disableNode(@Param() param: DisableNodeParamDto): Promise<DisableNodeResponseDto> {
        const res = await this.nodesService.disableNode(param.uuid);
        const data = errorHandler(res);
        return {
            response: data,
        };
    }

    @ApiOkResponse({
        type: DeleteNodeResponseDto,
        description: 'Node deleted',
    })
    @Endpoint({
        command: DeleteNodeCommand,
        httpCode: HttpStatus.OK,
    })
    async deleteNode(@Param() param: DeleteNodeParamDto): Promise<DeleteNodeResponseDto> {
        const res = await this.nodesService.deleteNode(param.uuid);
        const data = errorHandler(res);
        return {
            response: data,
        };
    }

    @ApiOkResponse({
        type: UpdateNodeResponseDto,
        description: 'Node updated',
    })
    @Endpoint({
        command: UpdateNodeCommand,
        httpCode: HttpStatus.OK,
    })
    async updateNode(@Body() body: UpdateNodeBodyDto): Promise<UpdateNodeResponseDto> {
        const res = await this.nodesService.updateNode(body);
        const data = errorHandler(res);
        return {
            response: data,
        };
    }

    @ApiOkResponse({
        type: RestartNodeResponseDto,
        description: 'Node restarted',
    })
    @Endpoint({
        command: RestartNodeCommand,
        httpCode: HttpStatus.OK,
    })
    async restartNode(
        @Param() param: RestartNodeParamDto,
        @Body() body: RestartNodeBodyDto,
    ): Promise<RestartNodeResponseDto> {
        const res = await this.nodesService.restartNode(param.uuid, body.forceRestart);
        const data = errorHandler(res);
        return {
            response: data,
        };
    }

    @ApiOkResponse({
        type: ResetNodeTrafficResponseDto,
        description: 'Event sent',
    })
    @Endpoint({
        command: ResetNodeTrafficCommand,
        httpCode: HttpStatus.OK,
    })
    async resetNodeTraffic(
        @Param() param: ResetNodeTrafficParamDto,
    ): Promise<ResetNodeTrafficResponseDto> {
        const res = await this.nodesService.resetNodeTraffic(param.uuid);
        const data = errorHandler(res);
        return {
            response: data,
        };
    }

    @ApiOkResponse({
        type: RestartAllNodesResponseDto,
        description: 'All nodes restarted',
    })
    @Endpoint({
        command: RestartAllNodesCommand,
        httpCode: HttpStatus.OK,
    })
    async restartAllNodes(
        @Body() body: RestartAllNodesBodyDto,
    ): Promise<RestartAllNodesResponseDto> {
        const res = await this.nodesService.restartAllNodes(body.forceRestart);
        const data = errorHandler(res);
        return {
            response: data,
        };
    }

    @ApiOkResponse({
        type: ReorderNodesResponseDto,
        description: 'Nodes reordered successfully',
    })
    @Endpoint({
        command: ReorderNodesCommand,
        httpCode: HttpStatus.OK,
    })
    async reorderNodes(@Body() body: ReorderNodesBodyDto): Promise<ReorderNodesResponseDto> {
        const result = await this.nodesService.reorderNodes(body);

        const data = errorHandler(result);
        return {
            response: data,
        };
    }

    @ApiOkResponse({
        type: ProfileModificationResponseDto,
        description: 'Event sent successfully',
    })
    @Endpoint({
        command: BulkNodesProfileModificationCommand,
        httpCode: HttpStatus.OK,
    })
    async profileModification(
        @Body() body: ProfileModificationBodyDto,
    ): Promise<ProfileModificationResponseDto> {
        const result = await this.nodesService.profileModification(body);

        const data = errorHandler(result);
        return {
            response: data,
        };
    }

    @ApiOkResponse({
        type: BulkNodesActionsResponseDto,
        description: 'Event sent successfully',
    })
    @Endpoint({
        command: BulkNodesActionsCommand,
        httpCode: HttpStatus.OK,
    })
    async bulkNodesActions(
        @Body() body: BulkNodesActionsBodyDto,
    ): Promise<BulkNodesActionsResponseDto> {
        const result = await this.nodesService.bulkNodesActions(body);

        const data = errorHandler(result);
        return {
            response: data,
        };
    }

    @ApiOkResponse({
        type: BulkNodesUpdateResponseDto,
        description: 'Event sent successfully',
    })
    @Endpoint({
        command: BulkNodesUpdateCommand,
        httpCode: HttpStatus.OK,
    })
    async bulkNodesUpdate(
        @Body() body: BulkNodesUpdateBodyDto,
    ): Promise<BulkNodesUpdateResponseDto> {
        const result = await this.nodesService.bulkNodesUpdate(body);

        const data = errorHandler(result);
        return {
            response: data,
        };
    }
}
