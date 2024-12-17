import { Module } from "@nestjs/common";
import { BotService } from "./bot.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Department } from "./entities/department-entity";
import { Role } from "./entities/role.entity";
import { UserRoles } from "./entities/userRoles.entity";
import { Users } from "./entities/users.entity";
import { BotUpdate } from "./bot.update";
import { UsersService } from "./users/users.service";
import { UsersUpdate } from "./users/users.update";

@Module({
  imports: [TypeOrmModule.forFeature([Department, Role, UserRoles, Users])],
  providers: [BotService, UsersService, UsersUpdate, BotUpdate],
})
export class BotModule {}
