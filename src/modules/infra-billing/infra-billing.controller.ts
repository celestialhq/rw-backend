import { Body, Controller, HttpStatus, Param, Query, UseFilters, UseGuards } from '@nestjs/common';
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
import { RolesGuard } from '@common/guards/roles';
import { ScopesGuard } from '@common/guards/scopes';
import { errorHandler } from '@common/helpers/error-handler.helper';
import { CONTROLLERS_INFO, INFRA_BILLING_CONTROLLER } from '@libs/contracts/api';
import {
    CreateInfraBillingRecordCommand,
    CreateInfraBillingNodeCommand,
    CreateInfraProviderCommand,
    DeleteInfraBillingRecordCommand,
    DeleteInfraBillingNodeCommand,
    DeleteInfraProviderCommand,
    GetInfraBillingRecordsCommand,
    GetInfraBillingNodesCommand,
    GetInfraProviderCommand,
    GetInfraProvidersCommand,
    UpdateInfraBillingNodeCommand,
    UpdateInfraProviderCommand,
} from '@libs/contracts/commands';
import { ROLE } from '@libs/contracts/constants';

import {
    CreateInfraBillingRecordBodyDto,
    CreateInfraBillingRecordResponseDto,
    CreateInfraBillingNodeBodyDto,
    CreateInfraBillingNodeResponseDto,
    CreateInfraProviderBodyDto,
    CreateInfraProviderResponseDto,
    DeleteInfraBillingRecordResponseDto,
    DeleteInfraBillingNodeResponseDto,
    DeleteInfraProviderResponseDto,
    GetInfraBillingRecordsQueryDto,
    GetInfraBillingRecordsResponseDto,
    GetInfraBillingNodesResponseDto,
    GetInfraProviderResponseDto,
    GetInfraProvidersResponseDto,
    UpdateInfraBillingNodeBodyDto,
    UpdateInfraBillingNodeResponseDto,
    UpdateInfraProviderBodyDto,
    UpdateInfraProviderResponseDto,
    GetInfraProviderParamDto,
    DeleteInfraProviderParamDto,
    DeleteInfraBillingRecordParamDto,
    DeleteInfraBillingNodeParamDto,
} from './dtos';
import { InfraBillingService } from './infra-billing.service';

@ApiBearerAuth('Authorization')
@ApiScopeResource(CONTROLLERS_INFO.INFRA_BILLING.resource)
@ApiTags(CONTROLLERS_INFO.INFRA_BILLING.tag)
@Roles(ROLE.ADMIN, ROLE.API)
@UseGuards(JwtDefaultGuard, RolesGuard, ScopesGuard)
@UseFilters(HttpExceptionFilter)
@Controller(INFRA_BILLING_CONTROLLER)
export class InfraBillingController {
    constructor(private readonly infraBillingService: InfraBillingService) {}

    @ApiOkResponse({
        type: GetInfraProvidersResponseDto,
        description: 'Infra providers retrieved successfully',
    })
    @Endpoint({
        command: GetInfraProvidersCommand,
        httpCode: HttpStatus.OK,
    })
    async getInfraProviders(): Promise<GetInfraProvidersResponseDto> {
        const result = await this.infraBillingService.getInfraProviders();

        const data = errorHandler(result);
        return {
            response: data,
        };
    }

    @ApiNotFoundResponse({
        description: 'Infra provider not found',
    })
    @ApiOkResponse({
        type: GetInfraProviderResponseDto,
        description: 'Infra provider retrieved successfully',
    })
    @Endpoint({
        command: GetInfraProviderCommand,
        httpCode: HttpStatus.OK,
    })
    async getInfraProvider(
        @Param() param: GetInfraProviderParamDto,
    ): Promise<GetInfraProviderResponseDto> {
        const result = await this.infraBillingService.getInfraProviderByUuid(param.uuid);

        const data = errorHandler(result);
        return {
            response: data,
        };
    }

    @ApiOkResponse({
        type: DeleteInfraProviderResponseDto,
        description: 'Infra provider deleted successfully',
    })
    @Endpoint({
        command: DeleteInfraProviderCommand,
        httpCode: HttpStatus.OK,
    })
    async delteInfraProvider(
        @Param() param: DeleteInfraProviderParamDto,
    ): Promise<DeleteInfraProviderResponseDto> {
        const result = await this.infraBillingService.deleteInfraProviderByUuid(param.uuid);

        const data = errorHandler(result);
        return {
            response: data,
        };
    }

    @ApiCreatedResponse({
        type: CreateInfraProviderResponseDto,
        description: 'Infra provider created successfully',
    })
    @Endpoint({
        command: CreateInfraProviderCommand,
        httpCode: HttpStatus.CREATED,
    })
    async createInfraProvider(
        @Body() body: CreateInfraProviderBodyDto,
    ): Promise<CreateInfraProviderResponseDto> {
        const result = await this.infraBillingService.createInfraProvider(body);

        const data = errorHandler(result);
        return {
            response: data,
        };
    }

    @ApiOkResponse({
        type: UpdateInfraProviderResponseDto,
        description: 'Infra provider updated successfully',
    })
    @Endpoint({
        command: UpdateInfraProviderCommand,
        httpCode: HttpStatus.OK,
    })
    async updateInfraProvider(
        @Body() body: UpdateInfraProviderBodyDto,
    ): Promise<UpdateInfraProviderResponseDto> {
        const result = await this.infraBillingService.updateInfraProvider(body);

        const data = errorHandler(result);
        return {
            response: data,
        };
    }

    @ApiCreatedResponse({
        type: CreateInfraBillingRecordResponseDto,
        description: 'Infra billing history record created successfully',
    })
    @Endpoint({
        command: CreateInfraBillingRecordCommand,
        httpCode: HttpStatus.CREATED,
    })
    async createInfraBillingRecord(
        @Body() body: CreateInfraBillingRecordBodyDto,
    ): Promise<CreateInfraBillingRecordResponseDto> {
        const result = await this.infraBillingService.createInfraBillingHistoryRecord(body);

        const data = errorHandler(result);
        return {
            response: data,
        };
    }

    @ApiOkResponse({
        type: GetInfraBillingRecordsResponseDto,
        description: 'Infra billing history records retrieved successfully',
    })
    @Endpoint({
        command: GetInfraBillingRecordsCommand,
        httpCode: HttpStatus.OK,
    })
    async getInfraBillingRecords(
        @Query() query: GetInfraBillingRecordsQueryDto,
    ): Promise<GetInfraBillingRecordsResponseDto> {
        const result = await this.infraBillingService.getInfraBillingHistoryRecords(query);

        const data = errorHandler(result);
        return {
            response: data,
        };
    }

    @ApiOkResponse({
        type: DeleteInfraBillingRecordResponseDto,
        description: 'Infra billing history record deleted successfully',
    })
    @Endpoint({
        command: DeleteInfraBillingRecordCommand,
        httpCode: HttpStatus.OK,
    })
    async deleteInfraBillingRecord(
        @Param() param: DeleteInfraBillingRecordParamDto,
    ): Promise<DeleteInfraBillingRecordResponseDto> {
        const result = await this.infraBillingService.deleteInfraBillingHistoryRecordByUuid(
            param.uuid,
        );

        const data = errorHandler(result);
        return {
            response: data,
        };
    }

    @ApiOkResponse({
        type: GetInfraBillingNodesResponseDto,
        description: 'Infra billing nodes retrieved successfully',
    })
    @Endpoint({
        command: GetInfraBillingNodesCommand,
        httpCode: HttpStatus.OK,
    })
    async getBillingNodes(): Promise<GetInfraBillingNodesResponseDto> {
        const result = await this.infraBillingService.getBillingNodes();

        const data = errorHandler(result);
        return {
            response: data,
        };
    }

    @ApiOkResponse({
        type: UpdateInfraBillingNodeResponseDto,
        description: 'Infra billing node updated successfully',
    })
    @Endpoint({
        command: UpdateInfraBillingNodeCommand,
        httpCode: HttpStatus.OK,
    })
    async updateInfraBillingNode(
        @Body() body: UpdateInfraBillingNodeBodyDto,
    ): Promise<UpdateInfraBillingNodeResponseDto> {
        const result = await this.infraBillingService.updateInfraBillingNode(body);

        const data = errorHandler(result);
        return {
            response: data,
        };
    }

    @ApiCreatedResponse({
        type: CreateInfraBillingNodeResponseDto,
        description: 'Infra billing node created successfully',
    })
    @Endpoint({
        command: CreateInfraBillingNodeCommand,
        httpCode: HttpStatus.CREATED,
    })
    async createInfraBillingNode(
        @Body() body: CreateInfraBillingNodeBodyDto,
    ): Promise<CreateInfraBillingNodeResponseDto> {
        const result = await this.infraBillingService.createInfraBillingNode(body);

        const data = errorHandler(result);
        return {
            response: data,
        };
    }

    @ApiOkResponse({
        type: DeleteInfraBillingNodeResponseDto,
        description: 'Infra billing node deleted successfully',
    })
    @Endpoint({
        command: DeleteInfraBillingNodeCommand,
        httpCode: HttpStatus.OK,
    })
    async deleteInfraBillingNode(
        @Param() param: DeleteInfraBillingNodeParamDto,
    ): Promise<DeleteInfraBillingNodeResponseDto> {
        const result = await this.infraBillingService.deleteInfraBillingNodeByUuid(param.uuid);

        const data = errorHandler(result);
        return {
            response: data,
        };
    }
}
