import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Context, Markup } from "telegraf";
import { Role } from "./entities/role.entity";
import { Repository } from "typeorm";
import { Users } from "./entities/users.entity";
import { UserRoles } from "./entities/userRoles.entity";
import { Department } from "./entities/department-entity";

@Injectable()
export class BotService {
  constructor(
    @InjectRepository(Role) private roleRepo: Repository<Role>,
    @InjectRepository(Users) private usersRepo: Repository<Users>,
    @InjectRepository(UserRoles) private userRolesRepo: Repository<UserRoles>,
    @InjectRepository(Department) private departmentRepo: Repository<Department>
  ) {}

  async onStart(ctx: Context) {
    try {
      const user_id = ctx.from.id;
      const user = await this.usersRepo.findOneBy({ id: user_id });

      if (user && user.last_state === "finish") {
        return await ctx.reply("Siz allaqachon ro'yxatdan o'tgansiz");
      }
      if (user && user.last_state !== "finish") {
        await this.usersRepo.delete({ id: user_id });
        await this.userRolesRepo.delete({ user_id });
      }
      const roles = await this.roleRepo.find();
      const chunkSize = 2;

      const inlineButton = [];
      for (let i = 0; i < roles.length; i += chunkSize) {
        const chunk = roles.slice(i, i + chunkSize).map((role) => ({
          text: `${role.name}`,
          callback_data: `role_${role.id}`,
        }));
        inlineButton.push(chunk);
      }

      await ctx.reply(
        "Assolomu alaykum, ro'yxatdan ot'ish uchun roleningizni tanlang 👇",
        {
          reply_markup: {
            inline_keyboard: inlineButton,
          },
        }
      );
    } catch (error) {
      console.error("ERROR On start: ", error);
    }
  }

  async onContact(ctx: Context) {
    try {
      if (!("contact" in ctx.message)) return;
      const departments = await this.departmentRepo.find();
      const user = await this.usersRepo.findOneBy({ id: ctx.from.id });

      if (user && user.last_state !== "finish") {
        if (user.last_state === "phone") {
          user.phone_number = ctx.message.contact.phone_number;
          user.last_state = "department";
          await this.usersRepo.save(user);
          const inlineButton = [];
          const chunkSize = 2;
          for (let i = 0; i < departments.length; i += chunkSize) {
            let chunk = departments
              .slice(i, i + chunkSize)
              .map((department) => ({
                text: `${department.name}`,
                callback_data: `department_${department.id}_${user.id}`,
              }));
            inlineButton.push(chunk);
          }
          await ctx.reply("Bo'limingizni tanlang: ", {
            reply_markup: {
              inline_keyboard: inlineButton,
              remove_keyboard: true,
            },
          });
        }
      }
    } catch (error) {
      console.error("ERROR ON onContact ", error);
    }
  }

  async onText(ctx: Context) {
    try {
      if (!("text" in ctx.message)) return;
      const departments = await this.departmentRepo.find();
      const user_id = ctx.from.id;
      const user = await this.usersRepo.findOneBy({ id: user_id });
      const phoneRegex = /^(?:\+998|998|0)?(90|91|93|94|95|97|98)\d{7}$/;

      if (user && user.last_state !== "finish") {
        if (user.last_state === "f_name") {
          user.f_name = ctx.message.text;
          user.last_state = "l_name";
          await this.usersRepo.save(user);
          await ctx.reply("Familiyangizni kiriting: ");
        } else if (user.last_state === "l_name") {
          user.l_name = ctx.message.text;
          user.last_state = "phone";
          await this.usersRepo.save(user);
          await ctx.reply("📞 Telefon raqamingizni kiriting yoki yuboring:", {
            ...Markup.keyboard([
              Markup.button.contactRequest("Kontakt yuborish"),
            ])
              .resize()
              .oneTime(),
          });
        } else if (user.last_state === "phone") {
          if (phoneRegex.test(ctx.message.text)) {
            user.phone_number = ctx.message.text;
            user.last_state = "department";
            await this.usersRepo.save(user);
            const inlineButton = [];
            const chunkSize = 2;
            for (let i = 0; i < departments.length; i += chunkSize) {
              let chunk = departments
                .slice(i, i + chunkSize)
                .map((department) => ({
                  text: `${department.name}`,
                  callback_data: `department_${department.id}_${user.id}`,
                }));
              inlineButton.push(chunk);
            }
            await ctx.reply("Bo'limingizni tanlang: ", {
              reply_markup: {
                inline_keyboard: inlineButton,
                remove_keyboard: true,
              },
            });
          } else {
            await ctx.reply(
              "Telefon raqam formati noto'g'ri . Iltimos, ushbu formatda (+998 || 998) 931631621  qaytadan kiriting.",
              { parse_mode: "HTML" }
            );
          }
        }
      }
    } catch (error) {
      console.error("ERROR ON onText: ", error);
    }
  }
}
