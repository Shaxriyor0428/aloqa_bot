import { Ctx, On, Start, Update } from "nestjs-telegraf";
import { BotService } from "./bot.service";
import { Context } from "telegraf";

@Update()
export class BotUpdate {
  constructor(private readonly botService: BotService) {}

  @Start()
  async onStart(@Ctx() ctx:Context){
    await this.botService.onStart(ctx)
  }

  @On("contact")
  async onContact(@Ctx() ctx:Context){
    await this.botService.onContact(ctx)
  }

  @On("text")
  async onText(@Ctx() ctx:Context){
    await this.botService.onText(ctx)
  }
}
