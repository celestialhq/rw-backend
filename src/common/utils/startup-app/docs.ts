import { apiReference } from '@scalar/nestjs-api-reference';
import { cleanupOpenApiDoc } from 'nestjs-zod';
import { readPackageJSON } from 'pkg-types';
import { SwaggerThemeNameEnum } from 'swagger-themes';
import { SwaggerTheme } from 'swagger-themes';

import { INestApplication } from '@nestjs/common';
import { DocumentBuilder } from '@nestjs/swagger';
import { SwaggerModule } from '@nestjs/swagger';

import { TypedConfigService } from '@common/config/app-config';
import { CONTROLLERS_INFO } from '@libs/contracts/api';
import { ERRORS } from '@libs/contracts/constants';

import {
    RemnawaveWebhookCrmEventsDto,
    RemnawaveWebhookErrorsEventsDto,
    RemnawaveWebhookNodeEventsDto,
    RemnawaveWebhookServiceEventsDto,
    RemnawaveWebhookUserEventsDto,
    RemnawaveWebhookUserHwidDevicesEventsDto,
    RemnawaveWebhookTorrentBlockerEventsDto,
} from './extra-models';

const description = `
Remnawave is a powerful proxy management tool, built on top of Xray-core, with a focus on simplicity and ease of use.

## Resources
* https://t.me/remnawave
* https://github.com/remnawave
* https://docs.rw
`;

export async function getDocs(app: INestApplication<unknown>, config: TypedConfigService) {
    const isSwaggerEnabled = config.getOrThrow('IS_DOCS_ENABLED');

    if (isSwaggerEnabled) {
        const pkg = await readPackageJSON();

        const configSwagger = new DocumentBuilder()
            .setTitle(`Remnawave API v${pkg.version}`)
            .addBearerAuth(
                {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    name: 'Authorization',
                    description: 'JWT obtained login.',
                },
                'Authorization',
            )
            .addBasicAuth(
                {
                    type: 'http',
                    scheme: 'basic',
                    name: 'Prometheus',
                    description: 'Prometheus Basic Auth',
                },
                'Prometheus',
            )
            .setDescription(description)
            .setVersion(pkg.version!)
            .setLicense('AGPL-3.0', 'https://github.com/remnawave/panel?tab=AGPL-3.0-1-ov-file')
            .addGlobalResponse({
                status: 500,
                description: ERRORS.INTERNAL_SERVER_ERROR.message,
                schema: {
                    type: 'object',
                    properties: {
                        timestamp: { type: 'string' },
                        path: { type: 'string' },
                        message: { type: 'string' },
                        errorCode: { type: 'string' },
                    },
                },
            })
            .addGlobalResponse({
                status: 400,
                description: 'Validation error',
                schema: {
                    type: 'object',
                    properties: {
                        message: { type: 'string' },
                        statusCode: { type: 'number', example: 400 },
                        errors: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    validation: { type: 'string', example: 'uuid' },
                                    code: { type: 'string', example: 'invalid_string' },
                                    message: { type: 'string', example: 'Invalid uuid' },
                                    path: {
                                        type: 'array',
                                        items: { type: 'string' },
                                        example: ['uuid'],
                                    },
                                },
                                required: ['validation', 'code', 'message', 'path'],
                            },
                            example: [
                                {
                                    validation: 'uuid',
                                    code: 'invalid_string',
                                    message: 'Invalid uuid',
                                    path: ['uuid'],
                                },
                            ],
                        },
                    },
                },
            });

        Object.values(CONTROLLERS_INFO).reduce((builder, { tag, description }) => {
            return builder.addTag(tag, description);
        }, configSwagger);

        const builtConfigSwagger = configSwagger.build();

        const documentFactory = () =>
            SwaggerModule.createDocument(app, builtConfigSwagger, {
                extraModels: [
                    RemnawaveWebhookUserEventsDto,
                    RemnawaveWebhookUserHwidDevicesEventsDto,
                    RemnawaveWebhookNodeEventsDto,
                    RemnawaveWebhookServiceEventsDto,
                    RemnawaveWebhookErrorsEventsDto,
                    RemnawaveWebhookCrmEventsDto,
                    RemnawaveWebhookTorrentBlockerEventsDto,
                ],
            });

        const theme = new SwaggerTheme();
        const options = {
            explorer: false,
            customCss: theme.getBuffer(SwaggerThemeNameEnum.ONE_DARK),
            customSiteTitle: 'Remnawave API Schema',
            swaggerOptions: {
                persistAuthorization: true,
            },
        };

        SwaggerModule.setup(
            config.getOrThrow('SWAGGER_PATH'),
            app,
            cleanupOpenApiDoc(documentFactory()),
            options,
        );

        app.use(
            config.getOrThrow('SCALAR_PATH'),

            apiReference({
                orderSchemaPropertiesBy: 'preserve',
                orderRequiredPropertiesFirst: true,
                showSidebar: true,
                layout: 'modern',
                hideModels: false,
                hideDownloadButton: false,
                hideTestRequestButton: false,
                isEditable: false,
                hideDarkModeToggle: false,
                withDefaultFonts: true,
                hideSearch: false,
                theme: 'purple',
                hideClientButton: false,
                darkMode: true,
                persistAuth: true,
                hiddenClients: [
                    'asynchttp',
                    'nethttp',
                    'okhttp',
                    'unirest',
                    'nsurlsession',
                    'httr',
                    'native',
                    'libcurl',
                    'httpclient',
                    'restsharp',
                    'clj_http',
                    'webrequest',
                    'restmethod',
                    'cohttp',
                ],
                defaultHttpClient: {
                    targetKey: 'js',
                    clientKey: 'axios',
                },
                telemetry: false,

                content: () => cleanupOpenApiDoc(documentFactory()),
            }),
        );
    }
}
