import { Injectable } from "@nestjs/common";
import { Repository } from "typeorm";
import { Users } from "../entities/users.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Context, Telegraf } from "telegraf";
import { InjectBot } from "nestjs-telegraf";
import { ADMIN_ID, BOT_NAME } from "../../app.constants";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Users) private readonly usersRepo: Repository<Users>,
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
      }
      await this.usersRepo.save({
        id: user_id,
        last_state: "f_name",
        role_id,
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

        await ctx.editMessageText("Bo'lim muvaffaqiyatli tanlandi ✅");
        await ctx.reply("Sizning malumotlaringiz adminga yuborildi, admin tasdiqlashi kutilmoqda... ✅", {
          reply_markup: {
            remove_keyboard: true,
          },
        });

        await this.bot.telegram.sendMessage(ADMIN_ID,"sfd")
      }
    } catch (error) {
      console.error("ERROR ON handleDepartment: ", error);
    }
  }
}
