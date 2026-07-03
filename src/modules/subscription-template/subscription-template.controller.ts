import { CONTROLLERS_INFO, SUBSCRIPTION_TEMPLATE_CONTROLLER } from '@contract/api';
import { ROLE } from '@contract/constants';

import { Body, Controller, HttpStatus, Param, UseFilters, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { Endpoint } from '@common/decorators/base-endpoint';
import { Roles } from '@common/decorators/roles/roles';
import { ApiScopeResource } from '@common/decorators/scopes';
import { HttpExceptionFilter } from '@common/exception/http-exception.filter';
import { JwtDefaultGuard } from '@common/guards/jwt-guards/def-jwt-guard';
import { RolesGuard } from '@common/guards/roles';
import { ScopesGuard } from '@common/guards/scopes';
import { errorHandler } from '@common/helpers/error-handler.helper';
import {
    CreateSubscriptionTemplateCommand,
    DeleteSubscriptionTemplateCommand,
    GetSubscriptionTemplateCommand,
    GetSubscriptionTemplatesCommand,
    ReorderSubscriptionTemplateCommand,
    UpdateSubscriptionTemplateCommand,
} from '@libs/contracts/commands';

import {
    CreateSubscriptionTemplateBodyDto,
    CreateSubscriptionTemplateResponseDto,
    DeleteSubscriptionTemplateParamDto,
    DeleteSubscriptionTemplateResponseDto,
    GetTemplateParamDto,
    GetTemplateResponseDto,
    GetTemplatesResponseDto,
    ReorderSubscriptionTemplatesBodyDto,
    ReorderSubscriptionTemplatesResponseDto,
    UpdateTemplateResponseDto,
    UpdateTemplateBodyDto,
} from './dtos/subscription-templates.dtos';
import { SubscriptionTemplateService } from './subscription-template.service';

@ApiBearerAuth('Authorization')
@ApiScopeResource(CONTROLLERS_INFO.SUBSCRIPTION_TEMPLATE.resource)
@ApiTags(CONTROLLERS_INFO.SUBSCRIPTION_TEMPLATE.tag)
@Roles(ROLE.ADMIN, ROLE.API)
@UseGuards(JwtDefaultGuard, RolesGuard, ScopesGuard)
@UseFilters(HttpExceptionFilter)
@Controller(SUBSCRIPTION_TEMPLATE_CONTROLLER)
export class SubscriptionTemplateController {
    constructor(private readonly subscriptionTemplateService: SubscriptionTemplateService) {}

    @ApiOkResponse({
        type: GetTemplatesResponseDto,
        description: 'Templates retrieved successfully',
    })
    @Endpoint({
        command: GetSubscriptionTemplatesCommand,
        httpCode: HttpStatus.OK,
    })
    async getAllTemplates(): Promise<GetTemplatesResponseDto> {
        const result = await this.subscriptionTemplateService.getAllTemplates();

        const data = errorHandler(result);
        return {
            response: data,
        };
    }

    @ApiOkResponse({
        type: GetTemplateResponseDto,
        description: 'Template retrieved successfully',
    })
    @Endpoint({
        command: GetSubscriptionTemplateCommand,
        httpCode: HttpStatus.OK,
    })
    async getTemplateByUuid(@Param() param: GetTemplateParamDto): Promise<GetTemplateResponseDto> {
        const result = await this.subscriptionTemplateService.getTemplateByUuid(param.uuid);
        const data = errorHandler(result);
        return {
            response: data,
        };
    }

    @ApiOkResponse({
        type: UpdateTemplateResponseDto,
        description: 'Template updated successfully',
    })
    @Endpoint({
        command: UpdateSubscriptionTemplateCommand,
        httpCode: HttpStatus.OK,
    })
    async updateTemplate(@Body() body: UpdateTemplateBodyDto): Promise<UpdateTemplateResponseDto> {
        const result = await this.subscriptionTemplateService.updateTemplate(
            body.uuid,
            body.name?.trim() ?? undefined,
            body.templateJson ?? undefined,
            body.encodedTemplateYaml ?? undefined,
        );

        const data = errorHandler(result);
        return {
            response: data,
        };
    }

    @ApiOkResponse({
        type: DeleteSubscriptionTemplateResponseDto,
        description: 'Template deleted successfully',
    })
    @Endpoint({
        command: DeleteSubscriptionTemplateCommand,
        httpCode: HttpStatus.OK,
    })
    async deleteTemplate(
        @Param() param: DeleteSubscriptionTemplateParamDto,
    ): Promise<DeleteSubscriptionTemplateResponseDto> {
        const result = await this.subscriptionTemplateService.deleteTemplate(param.uuid);

        const data = errorHandler(result);
        return {
            response: data,
        };
    }

    @ApiOkResponse({
        type: CreateSubscriptionTemplateResponseDto,
        description: 'Template created successfully',
    })
    @Endpoint({
        command: CreateSubscriptionTemplateCommand,
        httpCode: HttpStatus.CREATED,
    })
    async createTemplate(
        @Body() body: CreateSubscriptionTemplateBodyDto,
    ): Promise<CreateSubscriptionTemplateResponseDto> {
        const result = await this.subscriptionTemplateService.createTemplate(
            body.name,
            body.templateType,
        );

        const data = errorHandler(result);
        return {
            response: data,
        };
    }

    @ApiOkResponse({
        type: ReorderSubscriptionTemplatesResponseDto,
        description: 'Subscription templates reordered successfully',
    })
    @Endpoint({
        command: ReorderSubscriptionTemplateCommand,
        httpCode: HttpStatus.OK,
    })
    async reorderSubscriptionTemplates(
        @Body() body: ReorderSubscriptionTemplatesBodyDto,
    ): Promise<ReorderSubscriptionTemplatesResponseDto> {
        const result = await this.subscriptionTemplateService.reorderSubscriptionTemplates(body);

        const data = errorHandler(result);
        return {
            response: data,
        };
    }
}
