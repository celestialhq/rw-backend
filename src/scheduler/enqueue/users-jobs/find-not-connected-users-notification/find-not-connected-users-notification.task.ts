import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { Cron, SchedulerRegistry } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';

import { UsersQueuesService } from '@queue/_users';

import { JOBS_INTERVALS } from '../../../intervals';

@Injectable()
export class FindNotConnectedUsersNotificationTask implements OnApplicationBootstrap {
    private static readonly CRON_NAME = 'findNotConnectedUsersNotification';
    private readonly logger = new Logger(FindNotConnectedUsersNotificationTask.name);

    constructor(
        private readonly usersQueuesService: UsersQueuesService,
        private readonly configService: ConfigService,
        private schedulerRegistry: SchedulerRegistry,
    ) {}

    public async onApplicationBootstrap() {
        const isJobEnabled = this.configService.getOrThrow<string>(
            'NOT_CONNECTED_USERS_NOTIFICATIONS_ENABLED',
        );
        const isTelegramLoggerEnabled = this.configService.getOrThrow<string>(
            'IS_TELEGRAM_NOTIFICATIONS_ENABLED',
        );
        const isWebhookLoggerEnabled = this.configService.getOrThrow<string>('WEBHOOK_ENABLED');

        if (
            isJobEnabled === 'true' &&
            (isTelegramLoggerEnabled === 'true' || isWebhookLoggerEnabled === 'true')
        ) {
            const job = this.schedulerRegistry.getCronJob(
                FindNotConnectedUsersNotificationTask.CRON_NAME,
            );

            if (job) {
                job.start();
                this.logger.log('Job enabled.');
            }
        } else {
            try {
                this.schedulerRegistry.deleteCronJob(
                    FindNotConnectedUsersNotificationTask.CRON_NAME,
                );

                this.logger.log('Job disabled.');
            } catch (error) {
                this.logger.error(
                    `Error deleting "${FindNotConnectedUsersNotificationTask.CRON_NAME}" cron job: ${error}`,
                );
            }
        }
    }

    @Cron(JOBS_INTERVALS.NOT_CONNECTED_USERS_NOTIFICATIONS.FIND_USERS_TO_SEND_NOTIFICATIONS, {
        name: FindNotConnectedUsersNotificationTask.CRON_NAME,
        waitForCompletion: true,
        disabled: true,
    })
    async handleCron() {
        try {
            await this.usersQueuesService.findNotConnectedUsersNotification();
        } catch (error) {
            this.logger.error(`Error in FindNotConnectedUsersNotificationTask: ${error}`);
        }
    }
}
