import { Body, Controller, HttpStatus, Param, UseFilters, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { Endpoint } from '@common/decorators/base-endpoint';
import { Roles } from '@common/decorators/roles/roles';
import { ApiScopeResource } from '@common/decorators/scopes';
import { HttpExceptionFilter } from '@common/exception/http-exception.filter';
import { JwtDefaultGuard } from '@common/guards/jwt-guards/def-jwt-guard';
import { RolesGuard } from '@common/guards/roles';
import { ScopesGuard } from '@common/guards/scopes';
import { errorHandler } from '@common/helpers/error-handler.helper';
import { CONTROLLERS_INFO, IP_CONTROL_CONTROLLER } from '@libs/contracts/api';
import {
    DropConnectionsCommand,
    FetchIpsCommand,
    FetchIpsResultCommand,
    FetchUsersIpsCommand,
    FetchUsersIpsResultCommand,
} from '@libs/contracts/commands';
import { ROLE } from '@libs/contracts/constants';

import {
    FetchIpsBodyParamDto,
    FetchIpsResponseDto,
    FetchIpsResultParamDto,
    FetchIpsResultResponseDto,
    DropConnectionsBodyDto,
    FetchUsersIpsResponseDto,
    FetchUsersIpsParamDto,
    FetchUsersIpsResultParamDto,
    FetchUsersIpsResultResponseDto,
} from './dtos';
import { IpControlService } from './ip-control.service';

@ApiBearerAuth('Authorization')
@ApiScopeResource(CONTROLLERS_INFO.IP_CONTROL.resource)
@ApiTags(CONTROLLERS_INFO.IP_CONTROL.tag)
@Roles(ROLE.ADMIN, ROLE.API)
@UseGuards(JwtDefaultGuard, RolesGuard, ScopesGuard)
@UseFilters(HttpExceptionFilter)
@Controller(IP_CONTROL_CONTROLLER)
export class IpControlController {
    constructor(private readonly ipControlService: IpControlService) {}

    @Endpoint({
        type: FetchIpsResponseDto,
        command: FetchIpsCommand,
        httpCode: HttpStatus.CREATED,
    })
    async fetchUserIps(@Param() param: FetchIpsBodyParamDto): Promise<FetchIpsResponseDto> {
        const result = await this.ipControlService.fetchUserIps(param.uuid);

        const data = errorHandler(result);
        return {
            response: data,
        };
    }

    @Endpoint({
        type: FetchIpsResultResponseDto,
        command: FetchIpsResultCommand,
        httpCode: HttpStatus.OK,
    })
    async getFetchIpsResult(
        @Param() param: FetchIpsResultParamDto,
    ): Promise<FetchIpsResultResponseDto> {
        const result = await this.ipControlService.getFetchIpsResult(param.jobId);

        const data = errorHandler(result);
        return {
            response: data,
        };
    }

    @Endpoint({
        command: DropConnectionsCommand,
        httpCode: HttpStatus.ACCEPTED,
    })
    async dropConnections(@Body() body: DropConnectionsBodyDto) {
        const result = await this.ipControlService.dropConnections(body);

        errorHandler(result);
        return;
    }

    @Endpoint({
        type: FetchUsersIpsResponseDto,
        command: FetchUsersIpsCommand,
        httpCode: HttpStatus.CREATED,
    })
    async fetchUsersIps(@Param() param: FetchUsersIpsParamDto): Promise<FetchUsersIpsResponseDto> {
        const result = await this.ipControlService.fetchUsersIps(param.nodeUuid);

        const data = errorHandler(result);
        return {
            response: data,
        };
    }

    @Endpoint({
        type: FetchUsersIpsResultResponseDto,
        command: FetchUsersIpsResultCommand,
        httpCode: HttpStatus.OK,
    })
    async getFetchUsersIpsResult(
        @Param() param: FetchUsersIpsResultParamDto,
    ): Promise<FetchUsersIpsResultResponseDto> {
        const result = await this.ipControlService.getFetchUsersIpsResult(param.jobId);

        const data = errorHandler(result);
        return {
            response: data,
        };
    }
}
