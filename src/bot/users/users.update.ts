import { Action, Ctx, Update } from "nestjs-telegraf";
import { UsersService } from "./users.service";
import { Context } from "telegraf";

@Update()
export class UsersUpdate {
  constructor(private readonly usersService: UsersService) {}

  @Action(/role_+\d/)
  async onHandleRole(@Ctx() ctx: Context) {
    await this.usersService.onHandleRole(ctx);
  }

  @Action(/department_+\d+_\d+/)
  async onDepartment(@Ctx() ctx: Context) {
    await this.usersService.handleDepartment(ctx);
  }
}
