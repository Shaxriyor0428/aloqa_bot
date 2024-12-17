import { Injectable } from "@nestjs/common";
import { Repository } from "typeorm";
import { Users } from "../entities/users.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Context, Telegraf } from "telegraf";
import { UserRoles } from "../entities/userRoles.entity";
import { InjectBot } from "nestjs-telegraf";
import { BOT_NAME } from "../app.constants";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Users) private readonly usersRepo: Repository<Users>,
    @InjectRepository(UserRoles)
    private readonly userRolesRepo: Repository<UserRoles>,
    @InjectBot(BOT_NAME) private bot: Telegraf<Context>
  ) {}

  async onHandleRole(ctx: Context) {
    try {
      const user_id = ctx.from.id;
      const [_, role_id] = await ctx.callbackQuery["data"].split("_");
      const user = await this.usersRepo.findOneBy({ id: user_id });

      if (user && user.last_state === "finish") {
        return await ctx.reply("Siz allaqachon ro'yxatdan o'tgansiz");
      }
      if (user && user.last_state !== "finish") {
        await this.usersRepo.delete({ id: user_id });
        await this.userRolesRepo.delete({ user_id });
      }

      await this.userRolesRepo.save({
        user_id: user_id,
        role_id: role_id,
      });
      await this.usersRepo.save({
        id: user_id,
        last_state: "f_name",
      });
      return await ctx.editMessageText(
        "Rolengiz muvaffaqiyatli tanlandi ✅ \nIsmingizni kiriting: "
      );
    } catch (error) {
      console.error("ERROR ON onHandleRole", error);
    }
  }

  async handleDepartment(ctx: Context) {
    try {
      const [_, department_id, user_id] =
        await ctx.callbackQuery["data"].split("_");
      const user = await this.usersRepo.findOneBy({ id: user_id });
      if (!user) {
        return ctx.reply("Siz ro'yxatdan o'tmagansiz", {
          reply_markup: {
            keyboard: [[{ text: "/start" }]],
          },
        });
      }

      if (user.last_state === "department") {
        user.department_id = department_id;
        user.last_state = "finish";
        await this.usersRepo.save(user);
        await ctx.reply("Sizning malumotlaringiz muvaffaqiyatli saqlandi ✅", {
          reply_markup: {
            remove_keyboard: true,
          },
        });
      }
    } catch (error) {
      console.error("ERROR ON handleDepartment: ", error);
    }
  }
}
