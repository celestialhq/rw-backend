import { Body, Controller, HttpStatus, Param, Query, UseFilters, UseGuards } from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiCreatedResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiTags,
} from '@nestjs/swagger';

import { TypedConfigService } from '@common/config/app-config';
import { Endpoint } from '@common/decorators/base-endpoint';
import { Roles } from '@common/decorators/roles/roles';
import { ApiScopeResource } from '@common/decorators/scopes';
import { HttpExceptionFilter } from '@common/exception/http-exception.filter';
import { JwtDefaultGuard } from '@common/guards/jwt-guards/def-jwt-guard';
import { RolesGuard } from '@common/guards/roles';
import { ScopesGuard } from '@common/guards/scopes';
import { errorHandler } from '@common/helpers/error-handler.helper';
import { CONTROLLERS_INFO, USERS_CONTROLLER } from '@libs/contracts/api';
import {
    CreateUserCommand,
    DeleteUserCommand,
    DisableUserCommand,
    EnableUserCommand,
    GetUsersTagsCommand,
    GetUsersCommand,
    GetUserAccessibleNodesCommand,
    GetUserByIdCommand,
    GetUserByShortUuidCommand,
    GetUserByUsernameCommand,
    GetUserByUuidCommand,
    GetUsersStreamCommand,
    GetUserSubscriptionRequestHistoryCommand,
    ResetUserTrafficCommand,
    ResolveUserCommand,
    RevokeUserSubscriptionCommand,
    UpdateUserCommand,
} from '@libs/contracts/commands';
import { ROLE } from '@libs/contracts/constants';

import {
    CreateUserBodyDto,
    CreateUserResponseDto,
    DeleteUserParamDto,
    DeleteUserResponseDto,
    DisableUserParamDto,
    DisableUserResponseDto,
    EnableUserParamDto,
    EnableUserResponseDto,
    GetUsersTagsResponseDto,
    GetUsersQueryDto,
    GetUserAccessibleNodesParamDto,
    GetUserAccessibleNodesResponseDto,
    GetUserByIdResponseDto,
    GetUserByShortUuidParamDto,
    GetUserByShortUuidResponseDto,
    GetUserByUsernameParamDto,
    GetUserByUsernameResponseDto,
    GetUserByUuidParamDto,
    GetUserByUuidResponseDto,
    GetUsersStreamQueryDto,
    GetUsersStreamResponseDto,
    GetUserSubscriptionRequestHistoryParamDto,
    GetUserSubscriptionRequestHistoryResponseDto,
    ResetUserTrafficParamDto,
    ResetUserTrafficResponseDto,
    ResolveUserBodyDto,
    ResolveUserResponseDto,
    RevokeUserSubscriptionBodyDto,
    RevokeUserSubscriptionParamDto,
    RevokeUserSubscriptionResponseDto,
    UpdateUserBodyDto,
    UpdateUserResponseDto,
    GetUsersResponseDto,
    GetUserByIdParamDto,
} from '../dtos';
import {
    GetAllTagsResponseModel,
    GetAllUsersResponseModel,
    GetFullUserResponseModel,
    GetUsersStreamResponseModel,
} from '../models';
import { UsersService } from '../users.service';

@ApiBearerAuth('Authorization')
@ApiScopeResource(CONTROLLERS_INFO.USERS.resource)
@ApiTags(CONTROLLERS_INFO.USERS.tag)
@Roles(ROLE.ADMIN, ROLE.API)
@UseGuards(JwtDefaultGuard, RolesGuard, ScopesGuard)
@UseFilters(HttpExceptionFilter)
@Controller(USERS_CONTROLLER)
export class UsersController {
    public readonly subPublicDomain: string;
    constructor(
        private readonly usersService: UsersService,
        private readonly configService: TypedConfigService,
    ) {
        this.subPublicDomain = this.configService.getOrThrow('SUB_PUBLIC_DOMAIN');
    }

    @ApiCreatedResponse({
        type: CreateUserResponseDto,
        description: 'User created successfully',
    })
    @Endpoint({
        command: CreateUserCommand,
        httpCode: HttpStatus.CREATED,
    })
    async createUser(@Body() body: CreateUserBodyDto): Promise<CreateUserResponseDto> {
        const result = await this.usersService.createUser(body);

        const data = errorHandler(result);
        return {
            response: new GetFullUserResponseModel(data, this.subPublicDomain),
        };
    }

    @ApiOkResponse({
        type: UpdateUserResponseDto,
        description: 'User updated successfully',
    })
    @Endpoint({
        command: UpdateUserCommand,
        httpCode: HttpStatus.OK,
    })
    async updateUser(@Body() body: UpdateUserBodyDto): Promise<UpdateUserResponseDto> {
        const result = await this.usersService.updateUser(body);

        const data = errorHandler(result);
        return {
            response: new GetFullUserResponseModel(data, this.subPublicDomain),
        };
    }

    @ApiNotFoundResponse({
        description: 'User not found',
    })
    @ApiOkResponse({
        type: DeleteUserResponseDto,
        description: 'User deleted successfully',
    })
    @Endpoint({
        command: DeleteUserCommand,
        httpCode: HttpStatus.OK,
    })
    async deleteUser(@Param() param: DeleteUserParamDto): Promise<DeleteUserResponseDto> {
        const result = await this.usersService.deleteUser(param.uuid);

        const data = errorHandler(result);
        return {
            response: data,
        };
    }

    @ApiOkResponse({
        type: GetUsersResponseDto,
        description: 'Users fetched successfully',
    })
    @Endpoint({
        command: GetUsersCommand,
        httpCode: HttpStatus.OK,
    })
    async getUsers(@Query() query: GetUsersQueryDto): Promise<GetUsersResponseDto> {
        const { start, size, filters, filterModes, globalFilterMode, sorting } = query;

        const result = await this.usersService.getAllUsers({
            start,
            size,
            filters,
            filterModes,
            globalFilterMode,
            sorting,
        });

        const data = errorHandler(result);
        return {
            response: new GetAllUsersResponseModel({
                total: data.total,
                users: data.users.map(
                    (item) => new GetFullUserResponseModel(item, this.subPublicDomain),
                ),
            }),
        };
    }

    @ApiOkResponse({
        type: GetUsersStreamResponseDto,
        description: 'Users fetched successfully',
    })
    @Endpoint({
        command: GetUsersStreamCommand,
        httpCode: HttpStatus.OK,
    })
    async getUsersStream(
        @Query() query: GetUsersStreamQueryDto,
    ): Promise<GetUsersStreamResponseDto> {
        const result = await this.usersService.getUsersStream(query);

        const data = errorHandler(result);
        return {
            response: new GetUsersStreamResponseModel({
                users: data.users.map(
                    (item) => new GetFullUserResponseModel(item, this.subPublicDomain),
                ),
                nextCursor: data.nextCursor,
                hasMore: data.hasMore,
            }),
        };
    }

    @ApiOkResponse({
        type: GetUsersTagsResponseDto,
        description: 'Tags fetched successfully',
    })
    @Endpoint({
        command: GetUsersTagsCommand,
        httpCode: HttpStatus.OK,
    })
    async getUsersTags(): Promise<GetUsersTagsResponseDto> {
        const result = await this.usersService.getAllTags();

        const data = errorHandler(result);
        return {
            response: new GetAllTagsResponseModel({
                tags: data,
            }),
        };
    }

    @ApiNotFoundResponse({
        description: 'User not found',
    })
    @ApiOkResponse({
        type: GetUserAccessibleNodesResponseDto,
        description: 'User accessible nodes fetched successfully',
    })
    @Endpoint({
        command: GetUserAccessibleNodesCommand,
        httpCode: HttpStatus.OK,
    })
    async getUserAccessibleNodes(
        @Param() param: GetUserAccessibleNodesParamDto,
    ): Promise<GetUserAccessibleNodesResponseDto> {
        const result = await this.usersService.getUserAccessibleNodes(param.uuid);

        const data = errorHandler(result);
        return {
            response: data,
        };
    }

    @ApiNotFoundResponse({
        description: 'User not found',
    })
    @ApiOkResponse({
        type: GetUserSubscriptionRequestHistoryResponseDto,
        description: 'User subscription request history fetched successfully',
    })
    @Endpoint({
        command: GetUserSubscriptionRequestHistoryCommand,
        httpCode: HttpStatus.OK,
    })
    async getUserSubscriptionRequestHistory(
        @Param() param: GetUserSubscriptionRequestHistoryParamDto,
    ): Promise<GetUserSubscriptionRequestHistoryResponseDto> {
        const result = await this.usersService.getUserSubscriptionRequestHistory(param.uuid);

        const data = errorHandler(result);
        return {
            response: data,
        };
    }

    /* get by methods




    */

    @ApiNotFoundResponse({
        description: 'User not found',
    })
    @ApiOkResponse({
        type: GetUserByShortUuidResponseDto,
        description: 'User fetched successfully',
    })
    @Endpoint({
        command: GetUserByShortUuidCommand,
        httpCode: HttpStatus.OK,
    })
    async getUserByShortUuid(
        @Param() param: GetUserByShortUuidParamDto,
    ): Promise<GetUserByShortUuidResponseDto> {
        const result = await this.usersService.getUserByUniqueFields({
            shortUuid: param.shortUuid,
        });

        const data = errorHandler(result);
        return {
            response: new GetFullUserResponseModel(data, this.subPublicDomain),
        };
    }

    @ApiNotFoundResponse({
        description: 'User not found',
    })
    @ApiOkResponse({
        type: GetUserByUuidResponseDto,
        description: 'User fetched successfully',
    })
    @Endpoint({
        command: GetUserByUuidCommand,
        httpCode: HttpStatus.OK,
    })
    async getUserByUuid(@Param() param: GetUserByUuidParamDto): Promise<GetUserByUuidResponseDto> {
        const result = await this.usersService.getUserByUniqueFields({ uuid: param.uuid });

        const data = errorHandler(result);
        return {
            response: new GetFullUserResponseModel(data, this.subPublicDomain),
        };
    }

    @ApiNotFoundResponse({
        description: 'User not found',
    })
    @ApiOkResponse({
        type: GetUserByUsernameResponseDto,
        description: 'User fetched successfully',
    })
    @Endpoint({
        command: GetUserByUsernameCommand,
        httpCode: HttpStatus.OK,
    })
    async getUserByUsername(
        @Param() param: GetUserByUsernameParamDto,
    ): Promise<GetUserByUsernameResponseDto> {
        const result = await this.usersService.getUserByUniqueFields({
            username: param.username,
        });

        const data = errorHandler(result);
        return {
            response: new GetFullUserResponseModel(data, this.subPublicDomain),
        };
    }

    @ApiNotFoundResponse({
        description: 'User not found',
    })
    @ApiOkResponse({
        type: GetUserByIdResponseDto,
        description: 'User fetched successfully',
    })
    @Endpoint({
        command: GetUserByIdCommand,
        httpCode: HttpStatus.OK,
    })
    async getUserById(@Param() param: GetUserByIdParamDto): Promise<GetUserByIdResponseDto> {
        const result = await this.usersService.getUserByUniqueFields({
            tId: param.id,
        });

        const data = errorHandler(result);
        return {
            response: new GetFullUserResponseModel(data, this.subPublicDomain),
        };
    }

    /* actions methods




    */

    @ApiNotFoundResponse({
        description: 'User not found',
    })
    @ApiOkResponse({
        type: RevokeUserSubscriptionResponseDto,
        description: 'User subscription revoked successfully',
    })
    @Endpoint({
        command: RevokeUserSubscriptionCommand,
        httpCode: HttpStatus.OK,
    })
    async revokeUserSubscription(
        @Param() param: RevokeUserSubscriptionParamDto,
        @Body() body: RevokeUserSubscriptionBodyDto,
    ): Promise<RevokeUserSubscriptionResponseDto> {
        const result = await this.usersService.revokeUserSubscription(param.uuid, body);

        const data = errorHandler(result);
        return {
            response: new GetFullUserResponseModel(data, this.subPublicDomain),
        };
    }

    @ApiNotFoundResponse({
        description: 'User not found',
    })
    @ApiOkResponse({
        type: DisableUserResponseDto,
        description: 'User disabled successfully',
    })
    @Endpoint({
        command: DisableUserCommand,
        httpCode: HttpStatus.OK,
    })
    async disableUser(@Param() param: DisableUserParamDto): Promise<DisableUserResponseDto> {
        const result = await this.usersService.disableUser(param.uuid);

        const data = errorHandler(result);
        return {
            response: new GetFullUserResponseModel(data, this.subPublicDomain),
        };
    }

    @ApiNotFoundResponse({
        description: 'User not found',
    })
    @ApiOkResponse({
        type: EnableUserResponseDto,
        description: 'User enabled successfully',
    })
    @Endpoint({
        command: EnableUserCommand,
        httpCode: HttpStatus.OK,
    })
    async enableUser(@Param() param: EnableUserParamDto): Promise<EnableUserResponseDto> {
        const result = await this.usersService.enableUser(param.uuid);

        const data = errorHandler(result);
        return {
            response: new GetFullUserResponseModel(data, this.subPublicDomain),
        };
    }

    @ApiNotFoundResponse({
        description: 'User not found',
    })
    @ApiOkResponse({
        type: ResetUserTrafficResponseDto,
        description: 'User traffic reset successfully',
    })
    @Endpoint({
        command: ResetUserTrafficCommand,
        httpCode: HttpStatus.OK,
    })
    async resetUserTraffic(
        @Param() param: ResetUserTrafficParamDto,
    ): Promise<ResetUserTrafficResponseDto> {
        const result = await this.usersService.resetUserTraffic(param.uuid);

        const data = errorHandler(result);
        return {
            response: new GetFullUserResponseModel(data, this.subPublicDomain),
        };
    }

    @ApiNotFoundResponse({
        description: 'User not found',
    })
    @ApiOkResponse({
        type: ResolveUserResponseDto,
        description: 'User resolved successfully',
    })
    @Endpoint({
        command: ResolveUserCommand,
        httpCode: HttpStatus.OK,
    })
    async resolveUser(@Body() body: ResolveUserBodyDto): Promise<ResolveUserResponseDto> {
        const result = await this.usersService.resolveUser(body);

        const data = errorHandler(result);
        return {
            response: data,
        };
    }
}
